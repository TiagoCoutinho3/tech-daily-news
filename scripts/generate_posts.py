#!/usr/bin/env python3
"""
Script: generate_posts.py
Descrição: Lê as notícias brutas em data/raw_news.json e usa modelos de IA locais
           (executados via Ollama no runner do GitHub Actions) para gerar os posts
           editoriais e as reações dos bots de bancada definidos em data/personas.json.
"""

import os
import json
import time
import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import requests

# Diretórios e caminhos de arquivos
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
RAW_NEWS_FILE = os.path.join(DATA_DIR, "raw_news.json")
PERSONAS_FILE = os.path.join(DATA_DIR, "personas.json")
POSTS_FILE = os.path.join(DATA_DIR, "posts.json")

# Configurações do Ollama (executado localmente no runner do Actions)
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:1.5b")
REQUEST_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "120"))


def call_ollama(prompt: str, system_prompt: str = "", temperature: float = 0.7) -> str:
    """
    Envia uma requisição para a API local do Ollama no runner.
    """
    url = f"{OLLAMA_HOST}/api/generate"
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "system": system_prompt,
        "stream": False,
        "options": {
            "temperature": temperature,
            "top_p": 0.9,
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "").strip()
    except Exception as e:
        print(f"  [ERRO Ollama] Falha ao consultar o modelo ({OLLAMA_MODEL}): {e}")
        return ""


def clean_response_text(text: str) -> str:
    """
    Remove aspas externas ou tags de markdown desnecessárias geradas por LLMs.
    """
    clean = text.strip()
    if (clean.startswith('"') and clean.endswith('"')) or (clean.startswith("'") and clean.endswith("'")):
        clean = clean[1:-1].strip()
    return clean


def generate_editor_content(news_item: Dict[str, Any], editor_persona: Dict[str, Any]) -> Dict[str, Any]:
    """
    Gera o título adaptado em português, a categoria e os parágrafos factuais da matéria.
    """
    system_prompt = editor_persona.get("system_prompt", "")
    temperature = editor_persona.get("temperature", 0.3)
    
    prompt = f"""Você é o editor principal do portal. Com base na seguinte notícia coletada:

Título Original: {news_item.get('titulo')}
Fonte: {news_item.get('fonte')}
Resumo Original: {news_item.get('resumo_original')}

Tarefa:
1. Traduza e adapte o título para português de forma clara, atraente e estritamente jornalística.
2. Defina a categoria mais adequada (Ex: 'Inteligência Artificial', 'Hardware & Dispositivos', 'Segurança & Privacidade', 'Sistemas & Open Source', 'Negócios & Startups').
3. Escreva um resumo factual em português estruturado em 2 a 3 parágrafos curtos e objetivos.

Responda ESTRITAMENTE em formato JSON com o seguinte formato:
{{
  "title": "Título em português",
  "category": "Categoria da Notícia",
  "paragraphs": [
    "Primeiro parágrafo do resumo factual...",
    "Segundo parágrafo detalhando o impacto ou dados...",
    "Terceiro parágrafo de conclusão factual..."
  ]
}}
"""

    response_text = call_ollama(prompt, system_prompt=system_prompt, temperature=temperature)
    
    # Extrair JSON da resposta caso o modelo adicione marcação markdown ```json ... ```
    json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
    if json_match:
        try:
            parsed = json.loads(json_match.group(0))
            return {
                "title": clean_response_text(parsed.get("title", news_item.get("titulo", ""))),
                "category": parsed.get("category", "Tecnologia"),
                "paragraphs": parsed.get("paragraphs", [news_item.get("resumo_original", "")])
            }
        except Exception:
            pass

    # Fallback estruturado se a resposta JSON falhar
    return {
        "title": news_item.get("titulo", "Notícia sem título"),
        "category": "Tecnologia",
        "paragraphs": [news_item.get("resumo_original", "Conteúdo não disponível.")]
    }


def generate_bot_reaction(
    news_title: str,
    news_summary: str,
    bot_id: str,
    persona: Dict[str, Any]
) -> str:
    """
    Gera a reação curta de um bot específico para a matéria.
    """
    system_prompt = persona.get("system_prompt", "")
    temperature = persona.get("temperature", 0.7)
    
    prompt = f"""Notícia: {news_title}
Contexto factual: {news_summary}

Escreva uma reação curta (1 a 2 frases, máximo 220 caracteres) encarnando 100% a sua personalidade ({persona.get('nome')}).
Responda APENAS com o texto da sua reação, sem aspas e sem introdução."""

    reaction = call_ollama(prompt, system_prompt=system_prompt, temperature=temperature)
    reaction = clean_response_text(reaction)
    
    # Se o modelo não respondeu, fallback temático
    if not reaction:
        fallbacks = {
            "cynic": "Mais uma rodada de promessas onde o único resultado concreto é o aumento da conta de nuvem.",
            "optimist": "Um avanço animador que abre caminho para soluções ainda mais inovadoras.",
            "skeptic": "Interessante no papel, mas quero ver como isso se comporta em alta escala e com tráfego real.",
            "humorous": "Mal posso esperar para ver como isso vai quebrar a minha sexta-feira em produção."
        }
        reaction = fallbacks.get(bot_id, "Comentário em processamento.")
        
    return reaction


def main():
    print("=" * 60)
    print(f"Iniciando geração de posts com IA (Ollama: {OLLAMA_MODEL})")
    print(f"Horário: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)

    # 1. Carregar personas
    if not os.path.exists(PERSONAS_FILE):
        print(f"[ERRO] Arquivo de personas não encontrado: {PERSONAS_FILE}")
        return

    with open(PERSONAS_FILE, "r", encoding="utf-8") as f:
        personas = json.load(f)

    # 2. Carregar notícias brutas
    if not os.path.exists(RAW_NEWS_FILE):
        print(f"[INFO] Nenhum arquivo {RAW_NEWS_FILE} encontrado. Encerrando.")
        return

    with open(RAW_NEWS_FILE, "r", encoding="utf-8") as f:
        raw_news = json.load(f)

    if not raw_news:
        print("[INFO] Nenhuma notícia nova em raw_news.json para processar.")
        return

    print(f"[INFO] {len(raw_news)} notícia(s) encontrada(s) para processar.")

    # 3. Carregar posts existentes para manter histórico e evitar duplicação
    existing_posts = []
    existing_ids = set()
    if os.path.exists(POSTS_FILE):
        try:
            with open(POSTS_FILE, "r", encoding="utf-8") as f:
                existing_posts = json.load(f)
                if isinstance(existing_posts, list):
                    existing_ids = {p.get("id") for p in existing_posts if "id" in p}
        except Exception as e:
            print(f"[AVISO] Erro ao carregar {POSTS_FILE}: {e}")

    editor_persona = personas.get("editor", {})
    reaction_bot_ids = [b_id for b_id in personas.keys() if b_id != "editor"]

    new_posts: List[Dict[str, Any]] = []

    for index, item in enumerate(raw_news, start=1):
        item_id = item.get("id")
        if item_id in existing_ids:
            print(f"[{index}/{len(raw_news)}] Pulando matéria já existente no posts.json (ID: {item_id})")
            continue

        print(f"\n[{index}/{len(raw_news)}] Processando: {item.get('titulo')[:50]}...")

        # a) Geração editorial (título, categoria e parágrafos)
        print("  -> Gerando resumo editorial (Nexus Editor)...")
        editor_data = generate_editor_content(item, editor_persona)
        summary_text = " ".join(editor_data["paragraphs"])

        # b) Geração das reações dos bots de bancada
        replies = []
        for bot_id in reaction_bot_ids:
            persona = personas.get(bot_id, {})
            bot_name = persona.get("nome", bot_id)
            print(f"  -> Gerando reação de {bot_name} ({bot_id})...")
            
            reaction_text = generate_bot_reaction(
                news_title=editor_data["title"],
                news_summary=summary_text,
                bot_id=bot_id,
                persona=persona
            )
            
            replies.append({
                "id": f"rep-{item_id}-{bot_id}",
                "botId": bot_id,
                "text": reaction_text
            })

        # Montar o objeto NewsPost exatamente compatível com o frontend React
        post_obj = {
            "id": item_id,
            "title": editor_data["title"],
            "category": editor_data["category"],
            "publishedAt": item.get("data_publicacao", datetime.now(timezone.utc).isoformat()),
            "paragraphs": editor_data["paragraphs"],
            "sourceName": item.get("fonte", "Fonte Externa"),
            "sourceUrl": item.get("link", "#"),
            "replies": replies
        }

        new_posts.append(post_obj)

    # 4. Salvar saída
    if new_posts:
        # Novos posts no topo, preservando histórico
        consolidated_posts = new_posts + existing_posts
        
        # Limite razoável para o feed não ficar infinito se desejado (ex: últimas 50 notícias)
        consolidated_posts = consolidated_posts[:50]

        os.makedirs(DATA_DIR, exist_ok=True)
        with open(POSTS_FILE, "w", encoding="utf-8") as f:
            json.dump(consolidated_posts, f, indent=2, ensure_ascii=False)
            
        print("\n" + "=" * 60)
        print(f"[SUCESSO] {len(new_posts)} novo(s) post(s) gerado(s) e salvo(s) em {POSTS_FILE}.")
        print(f"Total acumulado no posts.json: {len(consolidated_posts)}")
        print("=" * 60)
    else:
        print("\n[INFO] Nenhum post novo precisou ser gerado.")


if __name__ == "__main__":
    main()
