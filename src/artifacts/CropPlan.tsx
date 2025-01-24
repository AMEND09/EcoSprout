import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Droplet, Leaf, LayoutDashboard } from 'lucide-react';

interface ScheduleItem {
  id: number;
  cropId: number;
  type: 'water' | 'fertilize' | 'harvest';
  date: string;
  notes: string;
}

const CropPlan: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [newScheduleItem, setNewScheduleItem] = useState<Partial<ScheduleItem>>({});

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && newScheduleItem.cropId && newScheduleItem.type) {
      const item: ScheduleItem = {
        id: Date.now(),
        cropId: Number(newScheduleItem.cropId),
        type: newScheduleItem.type as 'water' | 'fertilize' | 'harvest',
        date: date.toISOString(),
        notes: newScheduleItem.notes || ''
      };
      setScheduleItems([...scheduleItems, item]);
      setIsAddingSchedule(false);
      setNewScheduleItem({});
    }
  };

  const getDayContent = (day: Date) => {
    const daySchedule = scheduleItems.filter(
      item => new Date(item.date).toDateString() === day.toDateString()
    );

    if (daySchedule.length === 0) return null;

    return (
      <div className="w-full h-full flex flex-col gap-1">
        {daySchedule.map(item => (
          <div key={item.id} className="text-xs flex items-center gap-1">
            {item.type === 'water' && <Droplet className="h-3 w-3 text-blue-500" />}
            {item.type === 'fertilize' && <Leaf className="h-3 w-3 text-green-500" />}
            {item.type === 'harvest' && <LayoutDashboard className="h-3 w-3 text-purple-500" />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Crop Schedule</CardTitle>
            <Button onClick={() => setIsAddingSchedule(true)}>Add Schedule</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            components={{
              DayContent: ({ date }) => getDayContent(date)
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={isAddingSchedule} onOpenChange={setIsAddingSchedule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Schedule</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSchedule} className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select
                onValueChange={(value) => setNewScheduleItem({ ...newScheduleItem, type: value as 'water' | 'fertilize' | 'harvest' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="fertilize">Fertilize</SelectItem>
                  <SelectItem value="harvest">Harvest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={newScheduleItem.notes || ''}
                onChange={(e) => setNewScheduleItem({ ...newScheduleItem, notes: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full">Add Schedule</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CropPlan;
