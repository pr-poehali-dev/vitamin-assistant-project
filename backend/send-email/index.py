import json
import os
import smtplib
import psycopg2
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Отправка email-уведомлений клиентам о статусе заказа
    Args: event с httpMethod, body (orderId, emailType, recipientEmail)
    Returns: HTTP response с результатом отправки
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
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    order_id = body_data.get('orderId')
    email_type = body_data.get('emailType', 'order_confirmation')
    recipient_email = body_data.get('recipientEmail')
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    try:
        cur.execute('''
            SELECT order_number, customer_name, customer_email, total_amount, status
            FROM orders WHERE id = %s
        ''', (order_id,))
        
        order = cur.fetchone()
        if not order:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Order not found'}),
                'isBase64Encoded': False
            }
        
        order_number, customer_name, customer_email, total_amount, status = order
        recipient = recipient_email or customer_email
        
        subject, html_content = generate_email_template(
            email_type, 
            customer_name, 
            order_number, 
            total_amount, 
            status
        )
        
        smtp_host = os.environ.get('SMTP_HOST')
        smtp_port = os.environ.get('SMTP_PORT', '587')
        smtp_user = os.environ.get('SMTP_USER')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        
        email_sent = False
        error_message = None
        
        if smtp_host and smtp_user and smtp_password:
            try:
                msg = MIMEMultipart('alternative')
                msg['Subject'] = subject
                msg['From'] = smtp_user
                msg['To'] = recipient
                
                html_part = MIMEText(html_content, 'html', 'utf-8')
                msg.attach(html_part)
                
                with smtplib.SMTP(smtp_host, int(smtp_port)) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_password)
                    server.send_message(msg)
                
                email_sent = True
            except Exception as e:
                error_message = str(e)
        else:
            error_message = 'SMTP settings not configured'
        
        cur.execute('''
            INSERT INTO email_logs (
                order_id, recipient_email, subject, email_type, 
                status, error_message, sent_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        ''', (
            order_id,
            recipient,
            subject,
            email_type,
            'sent' if email_sent else 'failed',
            error_message,
            datetime.now() if email_sent else None
        ))
        
        log_id = cur.fetchone()[0]
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': email_sent,
                'logId': log_id,
                'message': 'Email sent successfully' if email_sent else f'Email logged but not sent: {error_message}'
            })
        }
    
    finally:
        cur.close()
        conn.close()


def generate_email_template(email_type: str, customer_name: str, order_number: str, 
                            total_amount: int, status: str) -> tuple:
    base_style = '''
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
                   line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; 
                        border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                     color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .order-info { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .order-info p { margin: 8px 0; }
            .button { display: inline-block; background: #667eea; color: white; 
                     padding: 14px 32px; text-decoration: none; border-radius: 8px; 
                     margin: 20px 0; font-weight: 600; }
            .footer { background: #f9fafb; padding: 30px; text-align: center; 
                     color: #6b7280; font-size: 14px; }
        </style>
    '''
    
    if email_type == 'order_confirmation':
        subject = f'Заказ {order_number} оформлен!'
        html = f'''
        <html><head>{base_style}</head><body>
            <div class="container">
                <div class="header">
                    <h1>✅ Заказ оформлен!</h1>
                </div>
                <div class="content">
                    <p>Здравствуйте, {customer_name}!</p>
                    <p>Спасибо за заказ! Мы получили ваш заказ и уже начали его обработку.</p>
                    
                    <div class="order-info">
                        <p><strong>Номер заказа:</strong> {order_number}</p>
                        <p><strong>Сумма:</strong> {total_amount} ₽</p>
                        <p><strong>Статус:</strong> В обработке</p>
                    </div>
                    
                    <p>Мы отправим вам письмо, как только ваш заказ будет отправлен.</p>
                    <a href="#" class="button">Отследить заказ</a>
                </div>
                <div class="footer">
                    <p>Это автоматическое письмо. Не отвечайте на него.</p>
                    <p>© 2025 Витамины. Все права защищены.</p>
                </div>
            </div>
        </body></html>
        '''
    
    elif email_type == 'order_shipped':
        subject = f'Заказ {order_number} отправлен!'
        html = f'''
        <html><head>{base_style}</head><body>
            <div class="container">
                <div class="header">
                    <h1>📦 Заказ в пути!</h1>
                </div>
                <div class="content">
                    <p>Здравствуйте, {customer_name}!</p>
                    <p>Ваш заказ отправлен и уже в пути к вам!</p>
                    
                    <div class="order-info">
                        <p><strong>Номер заказа:</strong> {order_number}</p>
                        <p><strong>Статус:</strong> Отправлен</p>
                        <p><strong>Ожидаемая доставка:</strong> 2-5 дней</p>
                    </div>
                    
                    <p>Вы можете отследить местоположение посылки по трек-номеру.</p>
                    <a href="#" class="button">Отследить посылку</a>
                </div>
                <div class="footer">
                    <p>Это автоматическое письмо. Не отвечайте на него.</p>
                    <p>© 2025 Витамины. Все права защищены.</p>
                </div>
            </div>
        </body></html>
        '''
    
    elif email_type == 'order_delivered':
        subject = f'Заказ {order_number} доставлен!'
        html = f'''
        <html><head>{base_style}</head><body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Заказ доставлен!</h1>
                </div>
                <div class="content">
                    <p>Здравствуйте, {customer_name}!</p>
                    <p>Ваш заказ успешно доставлен! Надеемся, вам всё понравилось.</p>
                    
                    <div class="order-info">
                        <p><strong>Номер заказа:</strong> {order_number}</p>
                        <p><strong>Статус:</strong> Доставлен</p>
                    </div>
                    
                    <p>Будем рады вашему отзыву о покупке!</p>
                    <a href="#" class="button">Оставить отзыв</a>
                </div>
                <div class="footer">
                    <p>Это автоматическое письмо. Не отвечайте на него.</p>
                    <p>© 2025 Витамины. Все права защищены.</p>
                </div>
            </div>
        </body></html>
        '''
    
    else:
        subject = f'Обновление по заказу {order_number}'
        html = f'''
        <html><head>{base_style}</head><body>
            <div class="container">
                <div class="header">
                    <h1>Обновление заказа</h1>
                </div>
                <div class="content">
                    <p>Здравствуйте, {customer_name}!</p>
                    <p>Статус вашего заказа изменился.</p>
                    
                    <div class="order-info">
                        <p><strong>Номер заказа:</strong> {order_number}</p>
                        <p><strong>Новый статус:</strong> {status}</p>
                    </div>
                </div>
                <div class="footer">
                    <p>Это автоматическое письмо. Не отвечайте на него.</p>
                    <p>© 2025 Витамины. Все права защищены.</p>
                </div>
            </div>
        </body></html>
        '''
    
    return subject, html
