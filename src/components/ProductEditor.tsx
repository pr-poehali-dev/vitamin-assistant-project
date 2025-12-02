import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  dosage: string;
  count: string;
  description: string;
  emoji: string;
  rating: number;
  popular: boolean;
  inStock: boolean;
  images?: string[];
  mainImage?: string;
  aboutDescription?: string;
  aboutUsage?: string;
  documents?: Array<{name: string; url: string}>;
  videos?: Array<{title: string; url: string}>;
  compositionDescription?: string;
  compositionTable?: Array<{component: string; mass: string; percentage: string}>;
}

interface ProductEditorProps {
  product: Product;
  onChange: (product: Product) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}

const ProductEditor = ({ product, onChange, onSave, onCancel, loading }: ProductEditorProps) => {
  const [newImage, setNewImage] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const addImage = () => {
    if (!newImage) return;
    onChange({...product, images: [...(product.images || []), newImage]});
    setNewImage('');
  };

  const removeImage = (index: number) => {
    const newImages = [...(product.images || [])];
    newImages.splice(index, 1);
    onChange({...product, images: newImages});
  };

  const addDocument = () => {
    if (!newDocName || !newDocUrl) return;
    onChange({...product, documents: [...(product.documents || []), {name: newDocName, url: newDocUrl}]});
    setNewDocName('');
    setNewDocUrl('');
  };

  const removeDocument = (index: number) => {
    const newDocs = [...(product.documents || [])];
    newDocs.splice(index, 1);
    onChange({...product, documents: newDocs});
  };

  const addVideo = () => {
    if (!newVideoTitle || !newVideoUrl) return;
    onChange({...product, videos: [...(product.videos || []), {title: newVideoTitle, url: newVideoUrl}]});
    setNewVideoTitle('');
    setNewVideoUrl('');
  };

  const removeVideo = (index: number) => {
    const newVideos = [...(product.videos || [])];
    newVideos.splice(index, 1);
    onChange({...product, videos: newVideos});
  };

  const addCompositionRow = () => {
    onChange({
      ...product, 
      compositionTable: [...(product.compositionTable || []), {component: '', mass: '', percentage: ''}]
    });
  };

  const updateCompositionRow = (index: number, field: string, value: string) => {
    const newTable = [...(product.compositionTable || [])];
    newTable[index] = {...newTable[index], [field]: value};
    onChange({...product, compositionTable: newTable});
  };

  const removeCompositionRow = (index: number) => {
    const newTable = [...(product.compositionTable || [])];
    newTable.splice(index, 1);
    onChange({...product, compositionTable: newTable});
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Основное</TabsTrigger>
          <TabsTrigger value="media">Изображения</TabsTrigger>
          <TabsTrigger value="about">О продукте</TabsTrigger>
          <TabsTrigger value="composition">Состав</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Название *</Label>
              <Input
                value={product.name}
                onChange={(e) => onChange({...product, name: e.target.value})}
                placeholder="Витамин D3"
              />
            </div>
            <div>
              <Label>Категория</Label>
              <Input
                value={product.category}
                onChange={(e) => onChange({...product, category: e.target.value})}
                placeholder="Витамины"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Цена (₽) *</Label>
              <Input
                type="number"
                value={product.price}
                onChange={(e) => onChange({...product, price: Number(e.target.value)})}
              />
            </div>
            <div>
              <Label>Дозировка</Label>
              <Input
                value={product.dosage}
                onChange={(e) => onChange({...product, dosage: e.target.value})}
                placeholder="2000 МЕ"
              />
            </div>
            <div>
              <Label>Количество</Label>
              <Input
                value={product.count}
                onChange={(e) => onChange({...product, count: e.target.value})}
                placeholder="90 капсул"
              />
            </div>
          </div>
          
          <div>
            <Label>Краткое описание</Label>
            <Textarea
              value={product.description}
              onChange={(e) => onChange({...product, description: e.target.value})}
              placeholder="Краткое описание товара для каталога"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Emoji</Label>
              <Input
                value={product.emoji}
                onChange={(e) => onChange({...product, emoji: e.target.value})}
                placeholder="☀️"
              />
            </div>
            <div>
              <Label>Рейтинг</Label>
              <Input
                type="number"
                step="0.1"
                value={product.rating}
                onChange={(e) => onChange({...product, rating: Number(e.target.value)})}
              />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.popular}
                  onChange={(e) => onChange({...product, popular: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm">Популярный</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.inStock}
                  onChange={(e) => onChange({...product, inStock: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm">В наличии</span>
              </label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
          <div>
            <Label>Основное изображение (URL)</Label>
            <Input
              value={product.mainImage || ''}
              onChange={(e) => onChange({...product, mainImage: e.target.value})}
              placeholder="https://example.com/main-image.jpg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Главное изображение, которое показывается в каталоге
            </p>
          </div>

          <div>
            <Label>Дополнительные изображения</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <Button type="button" onClick={addImage} size="sm">
                <Icon name="Plus" size={16} />
              </Button>
            </div>
            {product.images && product.images.length > 0 && (
              <div className="mt-3 space-y-2">
                {product.images.map((img, i) => (
                  <Card key={i} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img src={img} alt="" className="w-12 h-12 object-cover rounded" />
                      <span className="text-sm truncate">{img}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeImage(i)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
          <div>
            <Label>Описание</Label>
            <Textarea
              value={product.aboutDescription || ''}
              onChange={(e) => onChange({...product, aboutDescription: e.target.value})}
              placeholder="Подробное описание продукта, его свойств и особенностей"
              rows={5}
            />
          </div>

          <div>
            <Label>Применение</Label>
            <Textarea
              value={product.aboutUsage || ''}
              onChange={(e) => onChange({...product, aboutUsage: e.target.value})}
              placeholder="Как и когда принимать, дозировки, рекомендации"
              rows={5}
            />
          </div>

          <div>
            <Label>Документы и материалы (до 5 PDF)</Label>
            <div className="space-y-2 mt-2">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="Название документа"
                />
                <Input
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  placeholder="https://example.com/doc.pdf"
                  className="col-span-2"
                />
              </div>
              <Button 
                type="button" 
                onClick={addDocument} 
                size="sm" 
                disabled={(product.documents?.length || 0) >= 5}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить документ
              </Button>
            </div>
            {product.documents && product.documents.length > 0 && (
              <div className="mt-3 space-y-2">
                {product.documents.map((doc, i) => (
                  <Card key={i} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{doc.url}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeDocument(i)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Видео</Label>
            <div className="space-y-2 mt-2">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="Название видео"
                />
                <Input
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="col-span-2"
                />
              </div>
              <Button type="button" onClick={addVideo} size="sm">
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить видео
              </Button>
            </div>
            {product.videos && product.videos.length > 0 && (
              <div className="mt-3 space-y-2">
                {product.videos.map((video, i) => (
                  <Card key={i} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{video.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{video.url}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeVideo(i)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="composition" className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
          <div>
            <Label>Описание состава</Label>
            <Textarea
              value={product.compositionDescription || ''}
              onChange={(e) => onChange({...product, compositionDescription: e.target.value})}
              placeholder="Общее описание состава продукта"
              rows={4}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Таблица активных компонентов</Label>
              <Button type="button" onClick={addCompositionRow} size="sm">
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить строку
              </Button>
            </div>
            
            {(!product.compositionTable || product.compositionTable.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Нажмите "Добавить строку" чтобы начать
              </p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-sm font-semibold">
                  <div>Активные компоненты</div>
                  <div>Масса, мг</div>
                  <div>% от АУП*</div>
                  <div></div>
                </div>
                {product.compositionTable.map((row, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2">
                    <Input
                      value={row.component}
                      onChange={(e) => updateCompositionRow(i, 'component', e.target.value)}
                      placeholder="Витамин D3"
                    />
                    <Input
                      value={row.mass}
                      onChange={(e) => updateCompositionRow(i, 'mass', e.target.value)}
                      placeholder="50"
                    />
                    <Input
                      value={row.percentage}
                      onChange={(e) => updateCompositionRow(i, 'percentage', e.target.value)}
                      placeholder="100"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeCompositionRow(i)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              * АУП – адекватный уровень потребления по ЕСЭГТ.<br/>
              ** Не превышает верхний допустимый уровень потребления по ЕСЭГТ.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 pt-4 border-t">
        <Button onClick={onSave} disabled={loading} className="flex-1">
          {loading ? 'Сохранение...' : 'Сохранить'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </div>
  );
};

export default ProductEditor;
