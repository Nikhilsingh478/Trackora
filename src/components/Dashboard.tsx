import { Plus, Edit2, Trash2, StickyNote } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useState, useRef, useEffect } from 'react';
import { SleepTracker } from './SleepTracker';
import { DisciplineMeter } from './DisciplineMeter';
import { toast } from 'sonner';

export function Dashboard() {
  const {
    currentMonth,
    protocols,
    addProtocol,
    removeProtocol,
    editProtocol,
    getCellValue,
    setCellValue,
    getCellNote,
    setCellNote,
    getCompletionCount
  } = useData();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [newProtocolLabel, setNewProtocolLabel] = useState('');
  const [newProtocolColor, setNewProtocolColor] = useState('#06b6d4');
  const [editingProtocol, setEditingProtocol] = useState<{ id: string; label: string; color: string } | null>(null);
  const [noteContext, setNoteContext] = useState<{ day: number; protocolId: string; note: string; protocolLabel: string } | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState<boolean>(false);
  const [lastClickedCell, setLastClickedCell] = useState<{ day: number; protocolId: string } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleAddProtocol = () => {
    if (newProtocolLabel.trim()) {
      addProtocol(newProtocolLabel.trim(), newProtocolColor);
      setNewProtocolLabel('');
      setNewProtocolColor('#06b6d4');
      setIsAddOpen(false);
      toast.success('Protocol added!');
    }
  };

  const handleEditProtocol = () => {
    if (editingProtocol && editingProtocol.label.trim()) {
      editProtocol(editingProtocol.id, editingProtocol.label.trim(), editingProtocol.color);
      setEditingProtocol(null);
      setIsEditOpen(false);
      toast.success('Protocol updated!');
    }
  };

  const openEditDialog = (id: string, label: string, color: string) => {
    setEditingProtocol({ id, label, color });
    setIsEditOpen(true);
  };

  const openNoteDialog = (day: number, protocolId: string, protocolLabel: string) => {
    const note = getCellNote(day, protocolId);
    setNoteContext({ day, protocolId, note, protocolLabel });
    setIsNoteOpen(true);
  };

  const saveNote = () => {
    if (noteContext) {
      setCellNote(noteContext.day, noteContext.protocolId, noteContext.note);
      setIsNoteOpen(false);
      setNoteContext(null);
      toast.success('Note saved!');
    }
  };

  const handlePointerDown = (day: number, protocolId: string, e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    e.preventDefault();
    
    // Handle shift+click for range selection
    if (e.shiftKey && lastClickedCell && lastClickedCell.protocolId === protocolId) {
      const start = Math.min(lastClickedCell.day, day);
      const end = Math.max(lastClickedCell.day, day);
      const targetValue = !getCellValue(day, protocolId);
      
      for (let d = start; d <= end; d++) {
        setCellValue(d, protocolId, targetValue);
      }
      toast.success(`Filled ${end - start + 1} cells`);
      setLastClickedCell({ day, protocolId });
      return;
    }
    
    // Start drag operation
    setIsDragging(true);
    const currentValue = getCellValue(day, protocolId);
    const newValue = !currentValue;
    setDragValue(newValue);
    setCellValue(day, protocolId, newValue);
    setLastClickedCell({ day, protocolId });
  };

  const handlePointerEnter = (day: number, protocolId: string) => {
    if (isDragging) {
      setCellValue(day, protocolId, dragValue);
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };
    
    document.addEventListener('pointerup', handleGlobalPointerUp);
    return () => document.removeEventListener('pointerup', handleGlobalPointerUp);
  }, [isDragging]);

  // Horizontal scroll with wheel
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }
      
      if (grid.scrollWidth > grid.clientWidth) {
        e.preventDefault();
        grid.scrollLeft += e.deltaY;
      }
    };

    grid.addEventListener('wheel', handleWheel, { passive: false });
    return () => grid.removeEventListener('wheel', handleWheel);
  }, []);

  const handleRemoveProtocol = (id: string, label: string) => {
    removeProtocol(id);
    toast.success(`${label} removed`);
  };

  // Calculate Discipline Score
  const disciplineScore = (() => {
    if (protocols.length === 0) return 0;
    
    let totalPossible = 0;
    let completed = 0;

    // Based on user requirement: 
    // Score = (Total Completed Instances / Total Possible Instances in Month) * 100
    // Total Possible = Num Protocols * Days in Month
    
    totalPossible = protocols.length * daysInMonth;

    // Count actual completions
    for (let d = 1; d <= daysInMonth; d++) {
       protocols.forEach(p => {
          if (getCellValue(d, p.id)) completed++;
       });
    }
    
    return totalPossible > 0 ? (completed / totalPossible) * 100 : 0;
  })();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-3xl">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Track your daily progress</p>
      </div>

      <DisciplineMeter score={disciplineScore} />

      {/* Protocol Grid */}
      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden mb-8">
        <div ref={gridRef} className="overflow-x-auto overflow-y-auto max-h-[600px] relative">
          <div className="inline-block min-w-full">
            {/* Header Row - Sticky Top */}
            <div className="flex sticky top-0 z-20 bg-card border-b border-border backdrop-blur-sm bg-opacity-95">
              <div className="sticky left-0 z-30 w-[160px] min-w-[160px] max-w-[160px] sm:w-[220px] sm:min-w-[220px] sm:max-w-[220px] p-2 border-r border-border bg-muted/30 backdrop-blur-sm flex-shrink-0 flex-grow-0 overflow-hidden">
                <span className="text-sm text-muted-foreground truncate block w-full" title="Protocol">Protocol</span>
              </div>
              <div className="flex">
                {days.map(day => {
                  const dayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  return (
                    <div 
                      key={day} 
                      className={`w-12 p-2 text-center flex-shrink-0 border-r border-border ${isWeekend ? 'bg-muted/10' : ''}`}
                    >
                      <div className="text-xs text-muted-foreground">{dayNames[dayOfWeek]}</div>
                      <div className="text-sm mt-0.5">{day}</div>
                    </div>
                  );
                })}
              </div>
              <div className="w-20 p-2 flex-shrink-0 bg-muted/30">
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
            </div>

            {/* Protocol Rows */}
            {protocols.map((protocol) => {
              const completionCount = getCompletionCount(protocol.id);
              const completionPercentage = Math.round((completionCount / daysInMonth) * 100);
              
              return (
                <div
                  key={protocol.id}
                  className="flex border-b border-border hover:bg-muted/5 transition-colors group"
                  role="row"
                >
                  {/* Sticky Protocol Label */}
                  <div className="sticky left-0 z-10 w-[160px] min-w-[160px] max-w-[160px] sm:w-[220px] sm:min-w-[220px] sm:max-w-[220px] border-r border-border bg-card backdrop-blur-sm flex-shrink-0 flex-grow-0 group-hover:bg-muted/10 transition-colors overflow-hidden">
                    <div className="flex flex-col justify-center h-full p-2 w-full gap-1 overflow-hidden">
                      
                      {/* Label Container */}
                      <div className="flex items-center gap-2 w-full overflow-hidden" title={protocol.label}>
                        <div
                          className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: protocol.color }}
                        />
                        <span className="truncate text-xs sm:text-sm font-medium block min-w-0 flex-1">
                          {protocol.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1 w-full relative">
                        <span className="text-[10px] sm:text-xs text-muted-foreground">{completionPercentage}%</span>
                        {/* Action Buttons */}
                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditDialog(protocol.id, protocol.label, protocol.color)}
                            className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRemoveProtocol(protocol.id, protocol.label)}
                            className="p-1 hover:bg-destructive/10 rounded transition-colors text-muted-foreground hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Day Cells */}
                  <div className="flex">
                    {days.map(day => {
                      const isCompleted = getCellValue(day, protocol.id);
                      const hasNote = !!getCellNote(day, protocol.id);
                      
                      return (
                        <div
                          key={day}
                          className="w-12 p-2 flex items-center justify-center flex-shrink-0 border-r border-border"
                        >
                          <button
                            onPointerDown={(e) => handlePointerDown(day, protocol.id, e)}
                            onPointerEnter={() => handlePointerEnter(day, protocol.id)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              openNoteDialog(day, protocol.id, protocol.label);
                            }}
                            className={`relative w-7 h-7 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 select-none touch-none ${
                              isCompleted
                                ? 'shadow-md scale-105'
                                : 'bg-muted/50 hover:bg-muted hover:scale-105'
                            }`}
                            style={{
                              backgroundColor: isCompleted ? protocol.color : undefined,
                              boxShadow: isCompleted ? `0 2px 8px ${protocol.color}40` : undefined
                            }}
                            aria-pressed={isCompleted}
                            aria-label={`${protocol.label} - Day ${day} - ${isCompleted ? 'Completed' : 'Not completed'}`}
                          >
                            {hasNote && (
                              <div className="absolute -top-1 -right-1">
                                <StickyNote className="w-3 h-3 text-yellow-500 fill-yellow-500/20" />
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total Column */}
                  <div className="w-20 p-2 flex items-center justify-center flex-shrink-0 bg-muted/30">
                    <span className="text-sm font-medium">{completionCount}</span>
                  </div>
                </div>
              );
            })}

            {/* Add Protocol Row */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setIsAddOpen(true)}
                className="sticky left-0 z-10 w-[160px] min-w-[160px] max-w-[160px] sm:w-[220px] sm:min-w-[220px] sm:max-w-[220px] flex-shrink-0 flex-grow-0 block p-2 text-left text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors bg-card overflow-hidden"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Plus className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm truncate min-w-0 flex-1">Add Protocol</span>
                </div>
              </button>
            </div>

            {/* Empty State */}
            {protocols.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No protocols yet. Add your first one!</p>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Protocol
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sleep Tracker */}
      <SleepTracker />

      {/* Add Protocol Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Protocol</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="protocol-label">Protocol Name <span className="text-xs text-muted-foreground ml-1">(Max 20 chars)</span></Label>
              <Input
                id="protocol-label"
                value={newProtocolLabel}
                onChange={(e) => setNewProtocolLabel(e.target.value)}
                placeholder="e.g., Morning Exercise"
                maxLength={20}
                onKeyDown={(e) => e.key === 'Enter' && handleAddProtocol()}
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="protocol-color">Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  id="protocol-color"
                  type="color"
                  value={newProtocolColor}
                  onChange={(e) => setNewProtocolColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border"
                />
                <Input
                  value={newProtocolColor}
                  onChange={(e) => setNewProtocolColor(e.target.value)}
                  placeholder="#06b6d4"
                />
              </div>
            </div>
            <Button onClick={handleAddProtocol} className="w-full">
              Add Protocol
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Protocol Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Protocol</DialogTitle>
          </DialogHeader>
          {editingProtocol && (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="edit-protocol-label">Protocol Name <span className="text-xs text-muted-foreground ml-1">(Max 20 chars)</span></Label>
                <Input
                  id="edit-protocol-label"
                  value={editingProtocol.label}
                  onChange={(e) => setEditingProtocol({ ...editingProtocol, label: e.target.value })}
                  maxLength={20}
                  onKeyDown={(e) => e.key === 'Enter' && handleEditProtocol()}
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="edit-protocol-color">Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    id="edit-protocol-color"
                    type="color"
                    value={editingProtocol.color}
                    onChange={(e) => setEditingProtocol({ ...editingProtocol, color: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border"
                  />
                  <Input
                    value={editingProtocol.color}
                    onChange={(e) => setEditingProtocol({ ...editingProtocol, color: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleEditProtocol} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cell Note Dialog */}
      <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cell Note</DialogTitle>
          </DialogHeader>
          {noteContext && (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="cell-note">
                  Note for {noteContext.protocolLabel} - Day {noteContext.day}
                </Label>
                <Textarea
                  id="cell-note"
                  value={noteContext.note}
                  onChange={(e) => setNoteContext({ ...noteContext, note: e.target.value })}
                  placeholder="Add a note for this day..."
                  rows={4}
                />
              </div>
              <Button onClick={saveNote} className="w-full">
                Save Note
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}