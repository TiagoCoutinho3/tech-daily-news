#!/usr/bin/env python3
"""
Script: fetch_news.py
Descrição: Coleta notícias recentes de tecnologia via feeds RSS, realiza deduplicação
           e salva as novas notícias em formato JSON para processamento posterior.
"""

import os
import json
import hashlib
import re
import html
from datetime import datetime, timezone
import time
from typing import List, Dict, Any, Set
import requests
import feedparser
from bs4 import BeautifulSoup

# Diretórios e caminhos de arquivos
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
PROCESSED_LINKS_FILE = os.path.join(DATA_DIR, "processed_links.json")
RAW_NEWS_FILE = os.path.join(DATA_DIR, "raw_news.json")

# Configuração dos feeds RSS de tecnologia
FEEDS = [
    {
        "fonte": "TechCrunch",
        "url": "https://techcrunch.com/feed/"
    },
    {
        "fonte": "Ars Technica",
        "url": "https://arstechnica.com/feed/"
    },
    {
        "fonte": "The Verge",
        "url": "https://www.theverge.com/rss/index.xml"
    },
    # Fontes adicionais podem ser facilmente adicionadas aqui no futuro:
    # {"fonte": "Wired", "url": "https://www.wired.com/feed/rss"},
]

# Limites de coleta
MAX_ITEMS_PER_FEED = 5       # Quantidade máxima de itens recentes a avaliar por fonte
MAX_TOTAL_NEWS = 8           # Limite total de novas notícias salvas por execução
REQUEST_TIMEOUT = 15         # Timeout em segundos para requisições HTTP
USER_AGENT = "Mozilla/5.0 (compatible; TechDailyNewsBot/1.0; +https://github.com/)"


def clean_html(raw_html: str) -> str:
    """
    Remove tags HTML e decodifica entidades HTML mantendo o texto original limpo.
    Não altera o sentido do texto original.
    """
    if not raw_html:
        return ""
    
    # Decodificar entidades HTML (&amp;, &#8217;, etc.)
    text = html.unescape(raw_html)
    
    # Usar BeautifulSoup para extrair apenas o texto puro
    soup = BeautifulSoup(text, "html.parser")
    clean_text = soup.get_text(separator=" ", strip=True)
    
    # Normalizar espaços em branco múltiplos
    clean_text = re.sub(r"\s+", " ", clean_text).strip()
    return clean_text


def generate_id(link: str) -> str:
    """
    Gera um hash único baseado no link da matéria.
    """
    return hashlib.sha256(link.strip().encode("utf-8")).hexdigest()[:16]


def parse_publication_date(entry: Any) -> str:
    """
    Converte a data de publicação da matéria no feed para o formato ISO 8601.
    """
    struct_time = entry.get("published_parsed") or entry.get("updated_parsed")
    if struct_time:
        try:
            dt = datetime.fromtimestamp(time.mktime(struct_time), tz=timezone.utc)
            return dt.isoformat()
        except Exception:
            pass
    
    # Caso não seja possível fazer o parse pelo struct_time, usa a data atual UTC
    return datetime.now(timezone.utc).isoformat()


def load_processed_links() -> Set[str]:
    """
    Carrega o conjunto de links/IDs já processados anteriormente.
    """
    if not os.path.exists(PROCESSED_LINKS_FILE):
        return set()
    
    try:
        with open(PROCESSED_LINKS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return set(data)
    except (json.JSONDecodeError, IOError) as e:
        print(f"[AVISO] Erro ao ler {PROCESSED_LINKS_FILE}: {e}. Iniciando com lista vazia.")
    
    return set()


def save_processed_links(processed_links: Set[str]) -> None:
    """
    Salva a lista atualizada de links processados.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    # Salva ordenado para manter consistência no versionamento git
    with open(PROCESSED_LINKS_FILE, "w", encoding="utf-8") as f:
        json.dump(sorted(list(processed_links)), f, indent=2, ensure_ascii=False)


def save_raw_news(news_list: List[Dict[str, Any]]) -> None:
    """
    Sobrescreve o arquivo data/raw_news.json com as novas notícias coletadas.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(RAW_NEWS_FILE, "w", encoding="utf-8") as f:
        json.dump(news_list, f, indent=2, ensure_ascii=False)


def fetch_feed_entries(feed_info: Dict[str, str]) -> List[Any]:
    """
    Faz o download e parsing do feed RSS usando User-Agent personalizado.
    """
    url = feed_info["url"]
    fonte = feed_info["fonte"]
    print(f"[INFO] Buscando feed: {fonte} ({url})...")
    
    try:
        # Usar requests com headers para evitar bloqueios por 403 Forbidden
        headers = {"User-Agent": USER_AGENT}
        response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        
        # Parse do conteúdo retornado
        feed = feedparser.parse(response.content)
        
        if feed.bozo and not feed.entries:
            print(f"[AVISO] Possível problema no formato do feed {fonte}: {feed.bozo_exception}")
        
        entries = feed.entries[:MAX_ITEMS_PER_FEED]
        print(f"[INFO] {len(entries)} itens recentes obtidos de {fonte}.")
        return entries
    except Exception as e:
        print(f"[ERRO] Falha ao buscar feed {fonte}: {e}")
        return []


def main():
    print("=" * 60)
    print(f"Iniciando coleta de notícias - {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)

    # 1. Carregar histórico de links já processados
    processed_links = load_processed_links()
    print(f"[INFO] Total de links já processados anteriormente: {len(processed_links)}")

    new_news: List[Dict[str, Any]] = []
    new_links_to_add: Set[str] = set()
    data_coleta = datetime.now(timezone.utc).isoformat()

    # 2. Iterar por cada feed configurado
    for feed_info in FEEDS:
        if len(new_news) >= MAX_TOTAL_NEWS:
            print(f"[INFO] Limite total de {MAX_TOTAL_NEWS} notícias atingido. Interrompendo coleta.")
            break

        entries = fetch_feed_entries(feed_info)

        for entry in entries:
            if len(new_news) >= MAX_TOTAL_NEWS:
                break

            link = entry.get("link", "").strip()
            if not link:
                continue

            # Verificar deduplicação
            if link in processed_links or link in new_links_to_add:
                continue

            titulo = clean_html(entry.get("title", "Sem título"))
            
            # Obter resumo original (pode vir em summary ou description)
            raw_summary = entry.get("summary") or entry.get("description") or ""
            resumo_original = clean_html(raw_summary)

            noticia_id = generate_id(link)
            data_publicacao = parse_publication_date(entry)

            item = {
                "id": noticia_id,
                "titulo": titulo,
                "resumo_original": resumo_original,
                "fonte": feed_info["fonte"],
                "link": link,
                "data_publicacao": data_publicacao,
                "data_coleta": data_coleta
            }

            new_news.append(item)
            new_links_to_add.add(link)
            print(f"  [NOVA] [{feed_info['fonte']}] {titulo[:60]}... ({link})")

    # 3. Salvar saída
    print("-" * 60)
    print(f"[INFO] Total de novas notícias coletadas nesta execução: {len(new_news)}")
    
    save_raw_news(new_news)
    print(f"[SUCESSO] Arquivo salvo: {RAW_NEWS_FILE}")

    # 4. Atualizar controle de links se houver novos itens
    if new_links_to_add:
        processed_links.update(new_links_to_add)
        save_processed_links(processed_links)
        print(f"[SUCESSO] Controle atualizado: {PROCESSED_LINKS_FILE} (total acumulado: {len(processed_links)})")
    else:
        print("[INFO] Nenhum novo link para adicionar ao controle.")

    print("=" * 60)
    print("Coleta finalizada com sucesso.")
    print("=" * 60)


if __name__ == "__main__":
    main()
