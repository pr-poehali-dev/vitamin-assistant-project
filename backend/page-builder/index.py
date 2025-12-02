import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления страницами, блоками и вопросами анкеты
    Args: event с httpMethod, body, queryStringParameters
    Returns: HTTP response с данными страниц, блоков или вопросов
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
            
            elif resource == 'survey':
                cur.execute('''
                    SELECT id, question_text, question_type, options, is_required, 
                           display_order, is_active, created_at, updated_at
                    FROM survey_questions
                    ORDER BY display_order ASC
                ''')
                
                questions = []
                for row in cur.fetchall():
                    questions.append({
                        'id': row[0],
                        'questionText': row[1],
                        'questionType': row[2],
                        'options': row[3],
                        'isRequired': row[4],
                        'displayOrder': row[5],
                        'isActive': row[6],
                        'createdAt': row[7].isoformat() if row[7] else None,
                        'updatedAt': row[8].isoformat() if row[8] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'questions': questions})
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            params = event.get('queryStringParameters') or {}
            resource = params.get('resource', 'pages')
            
            if resource == 'survey':
                question_text = body_data.get('questionText', '')
                question_type = body_data.get('questionType', 'text')
                options = body_data.get('options')
                is_required = body_data.get('isRequired', True)
                display_order = body_data.get('displayOrder', 0)
                is_active = body_data.get('isActive', True)
                
                if display_order == 0:
                    cur.execute('SELECT COALESCE(MAX(display_order), 0) + 1 FROM survey_questions')
                    display_order = cur.fetchone()[0]
                
                cur.execute('''
                    INSERT INTO survey_questions 
                    (question_text, question_type, options, is_required, display_order, is_active)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (question_text, question_type, json.dumps(options) if options else None, 
                      is_required, display_order, is_active))
                
                new_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'id': new_id})
                }
            else:
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
            params = event.get('queryStringParameters') or {}
            resource = params.get('resource', 'pages')
            
            if resource == 'survey':
                question_id = body_data.get('id')
                
                if not question_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'success': False, 'error': 'ID не указан'})
                    }
                
                question_text = body_data.get('questionText')
                question_type = body_data.get('questionType')
                options = body_data.get('options')
                is_required = body_data.get('isRequired')
                display_order = body_data.get('displayOrder')
                is_active = body_data.get('isActive')
                
                cur.execute('''
                    UPDATE survey_questions
                    SET question_text = COALESCE(%s, question_text),
                        question_type = COALESCE(%s, question_type),
                        options = COALESCE(%s, options),
                        is_required = COALESCE(%s, is_required),
                        display_order = COALESCE(%s, display_order),
                        is_active = COALESCE(%s, is_active),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                ''', (question_text, question_type, json.dumps(options) if options else None, 
                      is_required, display_order, is_active, question_id))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
            else:
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
            resource = params.get('resource', 'pages')
            item_id = params.get('id')
            
            if resource == 'survey':
                cur.execute('DELETE FROM survey_questions WHERE id = %s', (item_id,))
            else:
                cur.execute('DELETE FROM pages WHERE id = %s', (item_id,))
            
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