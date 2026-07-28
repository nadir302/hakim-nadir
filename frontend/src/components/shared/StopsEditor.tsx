import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GripVertical, Plus, Trash2, MapPin } from 'lucide-react';

interface Stop {
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

interface StopsEditorProps {
  form: UseFormReturn<any>;
  fieldName?: string;
}

export default function StopsEditor({ form, fieldName = 'stops' }: StopsEditorProps) {
  const { fields, append, remove, swap } = useFieldArray({ control: form.control, name: fieldName });

  const addStop = () => {
    const nextOrder = fields.length > 0 ? Math.max(...fields.map((f: any) => f.order || 0)) + 1 : 1;
    append({ name: '', latitude: 0, longitude: 0, order: nextOrder });
  };

  return (
    <div className="sm:col-span-2 space-y-3">
      <div className="flex items-center justify-between">
        <Label>Route Stops</Label>
        <Button type="button" variant="outline" size="sm" onClick={addStop}><Plus className="mr-1 h-3 w-3" /> Add Stop</Button>
      </div>
      {fields.length === 0 && <p className="text-sm text-muted-foreground">No stops defined. Add stops along the route.</p>}
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2 rounded-lg border p-3">
            <div className="mt-2 shrink-0"><GripVertical className="h-4 w-4 text-muted-foreground" /></div>
            <div className="grid flex-1 gap-2 sm:grid-cols-4">
              <div className="sm:col-span-2"><Label className="text-xs">Name</Label><Input {...form.register(`${fieldName}.${index}.name`)} placeholder="Stop name" /></div>
              <div><Label className="text-xs">Latitude</Label><Input type="number" step="any" {...form.register(`${fieldName}.${index}.latitude`, { valueAsNumber: true })} /></div>
              <div><Label className="text-xs">Longitude</Label><Input type="number" step="any" {...form.register(`${fieldName}.${index}.longitude`, { valueAsNumber: true })} /></div>
              <input type="hidden" {...form.register(`${fieldName}.${index}.order`)} value={index + 1} />
            </div>
            <Button type="button" variant="ghost" size="sm" className="mt-5 shrink-0 text-destructive" onClick={() => remove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      {fields.length >= 2 && (
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" disabled={true} className="text-xs"><MapPin className="mr-1 h-3 w-3" /> {fields.length} stops</Button>
        </div>
      )}
    </div>
  );
}
