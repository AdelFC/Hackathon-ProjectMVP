import { useState } from 'react';
import { z } from 'zod';
import { useProjectStore } from '../../stores/projectStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useToast } from '../ui/Toast';

const brandSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  domain: z.string().refine(
    (val) => !val || val === '' || /^https?:\/\/.+\..+/.test(val),
    'URL invalide (doit commencer par http:// ou https://)'
  ).optional(),
  oneLiner: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  tone: z.string().min(3, 'Le ton doit contenir au moins 3 caractères'),
  doDont: z.object({
    do: z.array(z.string()).min(1, 'Ajoutez au moins une bonne pratique'),
    dont: z.array(z.string()).min(1, 'Ajoutez au moins une pratique à éviter')
  }),
  hashtags: z.array(z.string()).min(1, 'Ajoutez au moins un hashtag')
});

type BrandFormData = z.infer<typeof brandSchema>;

interface BrandFormProps {
  onSubmit?: () => void;
}

export function BrandForm({ onSubmit }: BrandFormProps) {
  const { setBrandIdentity, brandIdentity } = useProjectStore();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState<BrandFormData>({
    name: brandIdentity?.name || '',
    domain: brandIdentity?.website || '',
    oneLiner: brandIdentity?.mission || '',
    tone: brandIdentity?.voice || '',
    doDont: {
      do: brandIdentity?.features?.filter(f => f.startsWith('DO:'))?.map(f => f.replace('DO:', '')) || [''],
      dont: brandIdentity?.features?.filter(f => f.startsWith('DONT:'))?.map(f => f.replace('DONT:', '')) || ['']
    },
    hashtags: brandIdentity?.features?.filter(f => f.startsWith('#')) || ['']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [doInput, setDoInput] = useState('');
  const [dontInput, setDontInput] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = brandSchema.parse(formData);
      
      setBrandIdentity({
        name: validatedData.name,
        industry: '',
        website: validatedData.domain || '',
        mission: validatedData.oneLiner,
        targetAudience: '',
        usp: '',
        voice: validatedData.tone,
        features: [
          ...validatedData.doDont.do.map(d => `DO:${d}`),
          ...validatedData.doDont.dont.map(d => `DONT:${d}`),
          ...validatedData.hashtags
        ]
      });
      
      showToast({
        title: 'Identité de marque enregistrée',
        type: 'success'
      });
      
      setErrors({});
      onSubmit?.();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  const addDoItem = () => {
    if (doInput.trim()) {
      setFormData(prev => ({
        ...prev,
        doDont: {
          ...prev.doDont,
          do: [...prev.doDont.do.filter(d => d), doInput.trim()]
        }
      }));
      setDoInput('');
    }
  };

  const addDontItem = () => {
    if (dontInput.trim()) {
      setFormData(prev => ({
        ...prev,
        doDont: {
          ...prev.doDont,
          dont: [...prev.doDont.dont.filter(d => d), dontInput.trim()]
        }
      }));
      setDontInput('');
    }
  };

  const addHashtag = () => {
    let tag = hashtagInput.trim();
    if (tag) {
      if (!tag.startsWith('#')) tag = `#${tag}`;
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags.filter(h => h), tag]
      }));
      setHashtagInput('');
    }
  };

  const removeDoItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      doDont: {
        ...prev.doDont,
        do: prev.doDont.do.filter((_, i) => i !== index)
      }
    }));
  };

  const removeDontItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      doDont: {
        ...prev.doDont,
        dont: prev.doDont.dont.filter((_, i) => i !== index)
      }
    }));
  };

  const removeHashtag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div>
            <label className="label">Nom de la marque</label>
            <input
              type="text"
              className={`field ${errors.name ? 'border-red-500' : ''}`}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="StartPost"
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="label">Site web (optionnel)</label>
            <input
              type="text"
              className={`field ${errors.domain ? 'border-red-500' : ''}`}
              value={formData.domain}
              onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
              placeholder="https://startpost.ai"
            />
            {errors.domain && <p className="text-sm text-red-500 mt-1">{errors.domain}</p>}
          </div>

          <div>
            <label className="label">Description en une ligne</label>
            <input
              type="text"
              className={`field ${errors.oneLiner ? 'border-red-500' : ''}`}
              value={formData.oneLiner}
              onChange={(e) => setFormData(prev => ({ ...prev, oneLiner: e.target.value }))}
              placeholder="Le community manager AI qui comprend votre startup"
            />
            {errors.oneLiner && <p className="text-sm text-red-500 mt-1">{errors.oneLiner}</p>}
          </div>

          <div>
            <label className="label">Ton de communication</label>
            <input
              type="text"
              className={`field ${errors.tone ? 'border-red-500' : ''}`}
              value={formData.tone}
              onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
              placeholder="Professionnel, inspirant, accessible"
            />
            {errors.tone && <p className="text-sm text-red-500 mt-1">{errors.tone}</p>}
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <div>
            <label className="label">Bonnes pratiques (Do)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="field flex-1"
                value={doInput}
                onChange={(e) => setDoInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDoItem())}
                placeholder="Partager des insights concrets"
              />
              <Button type="button" onClick={addDoItem} variant="secondary">
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.doDont.do.filter(d => d).map((item, index) => (
                <span key={index} className="badge badge-green flex items-center gap-1">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeDoItem(index)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {errors['doDont.do'] && <p className="text-sm text-red-500 mt-1">{errors['doDont.do']}</p>}
          </div>

          <div>
            <label className="label">À éviter (Don't)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="field flex-1"
                value={dontInput}
                onChange={(e) => setDontInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDontItem())}
                placeholder="Utiliser du jargon technique complexe"
              />
              <Button type="button" onClick={addDontItem} variant="secondary">
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.doDont.dont.filter(d => d).map((item, index) => (
                <span key={index} className="badge badge-red flex items-center gap-1">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeDontItem(index)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {errors['doDont.dont'] && <p className="text-sm text-red-500 mt-1">{errors['doDont.dont']}</p>}
          </div>

          <div>
            <label className="label">Hashtags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="field flex-1"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                placeholder="startupfr"
              />
              <Button type="button" onClick={addHashtag} variant="secondary">
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.hashtags.filter(h => h).map((tag, index) => (
                <span key={index} className="badge badge-blue flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeHashtag(index)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {errors.hashtags && <p className="text-sm text-red-500 mt-1">{errors.hashtags}</p>}
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" variant="primary">
          Enregistrer l'identité de marque
        </Button>
      </div>
    </form>
  );
}