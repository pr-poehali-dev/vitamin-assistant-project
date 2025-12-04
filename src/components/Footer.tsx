import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface FooterProps {
  onNavigate?: (page: 'about' | 'partners') => void;
}

const Footer = ({ onNavigate }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Компания */}
          <div>
            <h3 className="font-bold text-lg mb-4">VitaMatch</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>ООО "ВитаМатч"</p>
              <p>ИНН: 1234567890</p>
              <p>ОГРН: 1234567890123</p>
            </div>
          </div>

          {/* Документы */}
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Icon name="FileText" size={18} />
              Документы
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Договор оферты
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Пользовательское соглашение
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Политика конфиденциальности
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Отказ от ответственности
                </a>
              </li>
            </ul>
          </div>

          {/* Компания */}
          <div>
            <h3 className="font-bold text-lg mb-4">Компания</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate?.('about')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  О нас
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.('partners')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Партнерская программа
                </button>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Icon name="Mail" size={18} />
              Контакты
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>support@vitamatch.ru</p>
              <p>+7 (800) 123-45-67</p>
              <div className="flex gap-3 mt-4">
                <button className="hover:text-primary transition-colors">
                  <Icon name="MessageCircle" size={20} />
                </button>
                <button className="hover:text-primary transition-colors">
                  <Icon name="Send" size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Дисклеймеры */}
        <Card className="p-6 bg-muted/50 border-2">
          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
              <p>
                <strong>Внимание:</strong> Размещённые на сайте продукты не являются лекарственными средствами.
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <Icon name="Info" size={16} className="mt-0.5 flex-shrink-0 text-blue-500" />
              <p>
                Сервис не осуществляет медицинскую деятельность и не оказывает Пользователям Сайта медицинские услуги, 
                в том числе направленные на профилактику, диагностику и лечение заболеваний.
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <Icon name="FileWarning" size={16} className="mt-0.5 flex-shrink-0 text-orange-500" />
              <p>
                Все рекомендации не носят предписательного характера. Пожалуйста, ознакомьтесь с Пользовательским соглашением 
                перед покупкой услуг и товаров.
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <Icon name="Copyright" size={16} className="mt-0.5 flex-shrink-0 text-primary" />
              <p>
                Все права защищены. Содержимое Сайта, в том числе любая текстовая информация и графические изображения, 
                являются интеллектуальной собственностью. Использование их третьими лицами, в том числе копирование, 
                воспроизведение и иное использование в любой форме запрещено.
              </p>
            </div>
          </div>
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© {currentYear} VitaMatch. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
