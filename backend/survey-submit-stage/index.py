import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Сохранение ответов расширенных анкет (этапы 2 и 3)
    Args: event - dict с httpMethod, body (survey_id, stage, answers)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с результатом
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        survey_id = body_data.get('survey_id')
        stage = body_data.get('stage', 2)
        answers = body_data.get('answers', {})
        
        if not survey_id or not answers:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'survey_id and answers are required'}),
                'isBase64Encoded': False
            }
        
        if stage not in [2, 3]:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'stage must be 2 or 3'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        # Сохраняем ответы
        for question_id, answer in answers.items():
            answer_json = json.dumps(answer) if isinstance(answer, (list, dict)) else answer
            
            cur.execute('''
                INSERT INTO t_p97156157_vitamin_assistant_pr.survey_answers (survey_id, question_id, answer, stage_number)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (survey_id, question_id) 
                DO UPDATE SET answer = EXCLUDED.answer, stage_number = EXCLUDED.stage_number
            ''', (survey_id, question_id, answer_json, stage))
        
        # Обновляем статус этапа
        if stage == 2:
            cur.execute('''
                UPDATE t_p97156157_vitamin_assistant_pr.user_surveys 
                SET stage2_completed = true, stage = 2, updated_at = NOW()
                WHERE id = %s
            ''', (survey_id,))
        elif stage == 3:
            cur.execute('''
                UPDATE t_p97156157_vitamin_assistant_pr.user_surveys 
                SET stage3_completed = true, stage = 3, completed = true, updated_at = NOW()
                WHERE id = %s
            ''', (survey_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True, 
                'survey_id': survey_id, 
                'stage': stage,
                'completed': stage == 3
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Server error: {str(e)}'}),
            'isBase64Encoded': False
        }
