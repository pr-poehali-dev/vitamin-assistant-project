import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Синхронизация каталога товаров с внешнего сайта
    Args: event с httpMethod, body (URL внешнего каталога)
    Returns: HTTP response с результатом синхронизации
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    catalog_url = body_data.get('catalogUrl')
    products_data = body_data.get('products', [])
    
    if not catalog_url and not products_data:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'catalogUrl or products required'}),
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    try:
        imported_count = 0
        
        for product in products_data:
            cur.execute('''
                INSERT INTO products (
                    name, category, price, dosage, count, description,
                    emoji, rating, popular, external_url, in_stock
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            ''', (
                product.get('name'),
                product.get('category', 'Другое'),
                product.get('price', 0),
                product.get('dosage', ''),
                product.get('count', ''),
                product.get('description', ''),
                product.get('emoji', '💊'),
                product.get('rating', 0),
                product.get('popular', False),
                catalog_url,
                True
            ))
            imported_count += 1
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'importedCount': imported_count,
                'message': f'Импортировано товаров: {imported_count}'
            })
        }
    
    finally:
        cur.close()
        conn.close()
