import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface HowItWorksProps {
  onStartSurvey: () => void;
}

const steps = [
  {
    number: 1,
    title: 'Нажмите кнопку "Пройти опрос"',
    description: 'Начните путь к здоровью',
    icon: 'MousePointerClick',
    color: 'from-primary/20 to-primary/5'
  },
  {
    number: 2,
    title: 'Заполните анкету',
    description: 'Выберите ваши цели\nУкажите личные параметры\nПитание\nОбраз жизни\nЖалобы',
    time: 'Среднее время заполнения 10 минут',
    icon: 'ClipboardList',
    color: 'from-secondary/60 to-secondary/20'
  },
  {
    number: 3,
    title: 'Получите персональные рекомендации',
    description: 'Сервис обработает данные и подберет необходимые витамины для укрепления вашего здоровья.',
    icon: 'Sparkles',
    color: 'from-accent/60 to-accent/20'
  }
];

const HowItWorks = ({ onStartSurvey }: HowItWorksProps) => {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Как это работает
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Узнайте, какие витамины нужны вам
        </p>
        <p className="text-muted-foreground max-w-3xl mx-auto mt-2">
          Алгоритмы сервиса учитывают максимум ваших индивидуальных особенностей.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {steps.map((step, index) => (
          <Card 
            key={index} 
            className="p-8 hover-scale cursor-pointer transition-all duration-300 border-2 shadow-lg animate-fade-in relative overflow-hidden"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color} rounded-bl-full opacity-50`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mr-4">
                  {step.number}
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                  <Icon name={step.icon as any} size={28} className="text-primary" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {step.description}
              </p>
              
              {step.time && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
                  <Icon name="Clock" size={16} />
                  <span className="font-medium">{step.time}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center animate-fade-in" style={{ animationDelay: '450ms' }}>
        <Button 
          size="lg" 
          onClick={onStartSurvey}
          className="text-lg px-8 py-6 hover-scale"
        >
          <Icon name="Play" size={20} className="mr-2" />
          Пройти опрос
        </Button>
      </div>
    </section>
  );
};

export default HowItWorks;
