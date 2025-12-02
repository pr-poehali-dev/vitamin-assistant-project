import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { SurveyData } from '@/pages/Index';

interface ResultsProps {
  data: SurveyData;
  onViewCatalog: () => void;
  onBack: () => void;
}

const Results = ({ data, onViewCatalog, onBack }: ResultsProps) => {
  const recommendations = [
    {
      name: 'Витамин D3',
      dosage: '2000 МЕ',
      reason: 'Поддержка иммунитета и энергии',
      emoji: '☀️',
      priority: 'high'
    },
    {
      name: 'Омега-3',
      dosage: '1000 мг',
      reason: 'Здоровье сердца и мозга',
      emoji: '🐟',
      priority: 'high'
    },
    {
      name: 'Магний',
      dosage: '400 мг',
      reason: 'Снижение стресса, улучшение сна',
      emoji: '🌙',
      priority: 'medium'
    },
    {
      name: 'Витамин B-комплекс',
      dosage: '1 капсула',
      reason: 'Энергия и работоспособность',
      emoji: '⚡',
      priority: 'high'
    },
    {
      name: 'Цинк',
      dosage: '15 мг',
      reason: 'Иммунитет и восстановление',
      emoji: '🛡️',
      priority: 'medium'
    },
    {
      name: 'Коэнзим Q10',
      dosage: '100 мг',
      reason: 'Энергия клеток и антиоксидант',
      emoji: '💎',
      priority: 'low'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-primary text-primary-foreground';
      case 'medium': return 'bg-accent text-accent-foreground';
      case 'low': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Необходимо';
      case 'medium': return 'Рекомендовано';
      case 'low': return 'Опционально';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-6">
            <Icon name="Sparkles" size={48} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Ваш персональный план
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            На основе анализа ваших данных, мы подобрали оптимальный комплекс витаминов и добавок
          </p>
        </div>

        <Card className="p-8 mb-8 bg-gradient-to-br from-secondary/50 to-accent/30 border-0 shadow-lg animate-scale-in">
          <div className="flex items-center gap-4 mb-6">
            <Icon name="Target" size={32} className="text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Ваши цели</h3>
              <p className="text-muted-foreground">На что направлен подбор витаминов</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.goals.map((goal, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-2 px-4">
                {goal}
              </Badge>
            ))}
          </div>
        </Card>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Рекомендованные витамины</h2>
          <div className="grid gap-4">
            {recommendations.map((item, index) => (
              <Card 
                key={index} 
                className="p-6 hover-scale transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{item.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{item.name}</h3>
                      <Badge className={getPriorityColor(item.priority)}>
                        {getPriorityLabel(item.priority)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-2">{item.reason}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="Pill" size={16} className="text-primary" />
                      <span className="font-medium">{item.dosage}</span>
                      <span className="text-muted-foreground">ежедневно</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Icon name="Plus" size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-8 bg-gradient-to-br from-primary/5 to-muted/30 border-0 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <Icon name="Info" size={32} className="text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Рекомендации по приему</h3>
              <p className="text-muted-foreground">Как правильно принимать витамины</p>
            </div>
          </div>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <Icon name="CheckCircle2" size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Принимайте витамины во время еды для лучшего усвоения</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="CheckCircle2" size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Омега-3 и жирорастворимые витамины лучше усваиваются с жирной пищей</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="CheckCircle2" size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Магний рекомендуется принимать вечером для улучшения сна</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="CheckCircle2" size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Курс приема: минимум 3 месяца для накопительного эффекта</span>
            </li>
          </ul>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button variant="outline" onClick={onBack} className="flex-1 rounded-full">
            <Icon name="ArrowLeft" className="mr-2" size={18} />
            Вернуться
          </Button>
          <Button onClick={onViewCatalog} size="lg" className="flex-1 rounded-full">
            <Icon name="ShoppingCart" className="mr-2" size={18} />
            Перейти в каталог
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
