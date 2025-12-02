import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface HeroProps {
  onStartSurvey: () => void;
  onViewCatalog: () => void;
  onViewProfile?: () => void;
}

const Hero = ({ onStartSurvey, onViewCatalog, onViewProfile }: HeroProps) => {
  return (
    <div className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center lg:text-left animate-fade-in">
            <div className="inline-block px-4 py-2 bg-secondary rounded-full text-sm font-medium text-primary mb-4">
              AI-помощник по подбору витаминов
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Персональные витамины
              <span className="block text-primary mt-2">для вашего здоровья</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              Умная система анализирует ваш образ жизни, питание и цели, чтобы подобрать идеальный комплекс витаминов и добавок
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              {onViewProfile ? (
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 rounded-full hover-scale"
                  onClick={onViewProfile}
                >
                  <Icon name="User" className="mr-2" size={20} />
                  Мой личный кабинет
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 rounded-full hover-scale"
                  onClick={onStartSurvey}
                >
                  <Icon name="Sparkles" className="mr-2" size={20} />
                  Пройти анкету
                </Button>
              )}
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 rounded-full hover-scale"
                onClick={onViewCatalog}
              >
                <Icon name="Package" className="mr-2" size={20} />
                Каталог витаминов
              </Button>
            </div>
            
            <div className="flex items-center gap-8 justify-center lg:justify-start pt-6 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle2" className="text-primary" size={20} />
                <span>Научный подход</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Shield" className="text-primary" size={20} />
                <span>Безопасно</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Heart" className="text-primary" size={20} />
                <span>Персонально</span>
              </div>
            </div>
            
            {window.location.search.includes('admin') && (
              <Button 
                variant="link" 
                className="text-xs text-muted-foreground mt-4"
                onClick={() => window.location.href = '?view=admin'}
              >
                <Icon name="Settings" className="mr-1" size={14} />
                Админ-панель
              </Button>
            )}
          </div>
          
          <div className="flex-1 relative animate-scale-in">
            <div className="relative w-full max-w-lg mx-auto">
              <div className="absolute -top-10 -left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-accent/30 rounded-full blur-3xl"></div>
              
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-2">🧬</div>
                    <div className="font-semibold text-foreground">ДНК анализ</div>
                    <div className="text-sm text-muted-foreground mt-1">Точность</div>
                  </div>
                  <div className="bg-gradient-to-br from-secondary/80 to-secondary/60 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-2">🥗</div>
                    <div className="font-semibold text-foreground">Питание</div>
                    <div className="text-sm text-muted-foreground mt-1">Рацион</div>
                  </div>
                  <div className="bg-gradient-to-br from-accent/80 to-accent/60 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-2">💪</div>
                    <div className="font-semibold text-foreground">Активность</div>
                    <div className="text-sm text-muted-foreground mt-1">Образ жизни</div>
                  </div>
                  <div className="bg-gradient-to-br from-muted/80 to-muted/60 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-2">🎯</div>
                    <div className="font-semibold text-foreground">Цели</div>
                    <div className="text-sm text-muted-foreground mt-1">Результат</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;