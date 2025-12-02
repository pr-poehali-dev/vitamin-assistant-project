import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления страницами и блоками в конструкторе
    Args: event с httpMethod, body, queryStringParameters
    Returns: HTTP response с данными страниц или блоков
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            resource = params.get('resource', 'pages')
            slug = params.get('slug')
            
            if resource == 'pages':
                if slug:
                    cur.execute('''
                        SELECT id, slug, title, meta_description, is_published, 
                               blocks, styles, updated_at
                        FROM pages WHERE slug = %s
                    ''', (slug,))
                    row = cur.fetchone()
                    
                    if not row:
                        return {
                            'statusCode': 404,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Page not found'}),
                            'isBase64Encoded': False
                        }
                    
                    page = {
                        'id': row[0],
                        'slug': row[1],
                        'title': row[2],
                        'metaDescription': row[3],
                        'isPublished': row[4],
                        'blocks': row[5],
                        'styles': row[6],
                        'updatedAt': row[7].isoformat()
                    }
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'page': page})
                    }
                else:
                    cur.execute('''
                        SELECT id, slug, title, is_published, updated_at
                        FROM pages ORDER BY updated_at DESC
                    ''')
                    
                    pages = []
                    for row in cur.fetchall():
                        pages.append({
                            'id': row[0],
                            'slug': row[1],
                            'title': row[2],
                            'isPublished': row[3],
                            'updatedAt': row[4].isoformat()
                        })
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'pages': pages})
                    }
            
            elif resource == 'templates':
                cur.execute('''
                    SELECT id, name, category, preview_image, component_data, default_styles
                    FROM block_templates ORDER BY category, name
                ''')
                
                templates = []
                for row in cur.fetchall():
                    templates.append({
                        'id': row[0],
                        'name': row[1],
                        'category': row[2],
                        'previewImage': row[3],
                        'componentData': row[4],
                        'defaultStyles': row[5]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'templates': templates})
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cur.execute('''
                INSERT INTO pages (slug, title, meta_description, is_published, blocks, styles)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body_data.get('slug'),
                body_data.get('title'),
                body_data.get('metaDescription'),
                body_data.get('isPublished', False),
                json.dumps(body_data.get('blocks', [])),
                json.dumps(body_data.get('styles', {}))
            ))
            
            page_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'pageId': page_id})
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            page_id = body_data.get('id')
            
            cur.execute('''
                UPDATE pages 
                SET title = %s, meta_description = %s, is_published = %s, 
                    blocks = %s, styles = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body_data.get('title'),
                body_data.get('metaDescription'),
                body_data.get('isPublished'),
                json.dumps(body_data.get('blocks', [])),
                json.dumps(body_data.get('styles', {})),
                page_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            page_id = params.get('id')
            
            cur.execute('DELETE FROM pages WHERE id = %s', (page_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
