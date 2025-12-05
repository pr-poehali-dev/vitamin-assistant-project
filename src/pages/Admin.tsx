import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { getSurveyUrl, API_URLS } from '@/config/api';

interface Question {
  id: number;
  category: string;
  question_text: string;
  question_type: string;
  options?: any;
  placeholder?: string;
  required: boolean;
  order_index?: number;
  active: boolean;
}

const CATEGORY_OPTIONS = [
  { value: 'personal', label: 'Личные параметры' },
  { value: 'nutrition', label: 'Питание' },
  { value: 'lifestyle', label: 'Образ жизни' },
  { value: 'complaints', label: 'Жалобы и здоровье' }
];

const QUESTION_TYPE_OPTIONS = [
  { value: 'text', label: 'Текстовый ответ' },
  { value: 'number', label: 'Числовой ответ' },
  { value: 'single_choice', label: 'Один вариант' },
  { value: 'multiple_choice', label: 'Несколько вариантов' }
];

export default function Admin() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${getSurveyUrl('questions')}&includeInactive=true`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (question: Question) => {
    try {
      const method = question.id ? 'PUT' : 'POST';

      const response = await fetch(getSurveyUrl('questions'), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question)
      });

      if (response.ok) {
        await fetchQuestions();
        setEditingQuestion(null);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleToggleActive = async (question: Question) => {
    await handleSaveQuestion({ ...question, active: !question.active });
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот вопрос?')) return;

    try {
      const response = await fetch(`${getSurveyUrl('questions')}&id=${questionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchQuestions();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const filteredQuestions = selectedCategory === 'all'
    ? questions
    : questions.filter(q => q.category === selectedCategory);

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return (a.order_index || 0) - (b.order_index || 0);
  });

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Админ-панель</h1>
            <p className="text-muted-foreground">Управление вопросами анкеты</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Icon name="Plus" className="mr-2" size={20} />
            Добавить вопрос
          </Button>
        </div>

        <div className="mb-6">
          <Label>Фильтр по категории</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {CATEGORY_OPTIONS.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedQuestions.map((question) => (
              <Card key={question.id} className={!question.active ? 'opacity-50' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">
                          {CATEGORY_OPTIONS.find(c => c.value === question.category)?.label}
                        </Badge>
                        <Badge variant="secondary">
                          {QUESTION_TYPE_OPTIONS.find(t => t.value === question.question_type)?.label}
                        </Badge>
                        {question.required && (
                          <Badge variant="destructive">Обязательный</Badge>
                        )}
                        {!question.active && (
                          <Badge variant="outline" className="bg-gray-200">Неактивен</Badge>
                        )}
                      </div>
                      <p className="text-lg font-medium mb-2">{question.question_text}</p>
                      {question.options?.options && (
                        <div className="text-sm text-muted-foreground">
                          Варианты: {question.options.options.join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(question)}
                      >
                        <Icon name={question.active ? 'EyeOff' : 'Eye'} size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingQuestion(question)}
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {(editingQuestion || isCreating) && (
          <QuestionEditor
            question={editingQuestion}
            onSave={handleSaveQuestion}
            onCancel={() => {
              setEditingQuestion(null);
              setIsCreating(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

interface QuestionEditorProps {
  question: Question | null;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
  const [formData, setFormData] = useState<Partial<Question>>(
    question || {
      category: 'personal',
      question_text: '',
      question_type: 'text',
      required: true,
      active: true,
      options: {}
    }
  );
  const [optionsText, setOptionsText] = useState(
    question?.options?.options ? question.options.options.join('\n') : ''
  );

  const handleSave = () => {
    const finalData: Question = {
      id: formData.id || 0,
      category: formData.category || 'personal',
      question_text: formData.question_text || '',
      question_type: formData.question_type || 'text',
      required: formData.required || false,
      active: formData.active !== undefined ? formData.active : true,
      options: {}
    };

    if (formData.question_type === 'single_choice' || formData.question_type === 'multiple_choice') {
      finalData.options = {
        options: optionsText.split('\n').filter(o => o.trim())
      };
    } else if (formData.question_type === 'number') {
      finalData.options = {
        min: formData.options?.min,
        max: formData.options?.max,
        unit: formData.options?.unit
      };
    } else if (formData.question_type === 'text') {
      finalData.placeholder = formData.placeholder;
    }

    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{question ? 'Редактировать вопрос' : 'Создать вопрос'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Категория</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Текст вопроса</Label>
            <Textarea
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label>Тип вопроса</Label>
            <Select
              value={formData.question_type}
              onValueChange={(value) => setFormData({ ...formData, question_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPE_OPTIONS.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(formData.question_type === 'single_choice' || formData.question_type === 'multiple_choice') && (
            <div>
              <Label>Варианты ответов (по одному на строку)</Label>
              <Textarea
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                rows={5}
                placeholder="Вариант 1&#10;Вариант 2&#10;Вариант 3"
              />
            </div>
          )}

          {formData.question_type === 'text' && (
            <div>
              <Label>Подсказка (placeholder)</Label>
              <Input
                value={formData.placeholder || ''}
                onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.required}
                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Обязательный вопрос</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Активный</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Сохранить
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}