import { motion } from 'motion/react';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Download, Upload, Trash2, Moon, Sun, RefreshCw, Printer, FileJson } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { exportData, importData, clearMonthData, clearAllData } = useData();
  const [showClearMonth, setShowClearMonth] = useState(false);
  const [showClearAll, setShowClearAll] = useState(false);

  const handleExport = () => {
    const dataStr = exportData();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tracker-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            importData(content);
            toast.success('Data imported successfully');
          } catch (error) {
            toast.error('Failed to import data');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handlePrint = () => {
    window.print();
    toast.success('Opening print dialog...');
  };

  const handleClearMonth = () => {
    clearMonthData();
    setShowClearMonth(false);
    toast.success('Current month data cleared');
  };

  const handleClearAll = () => {
    clearAllData();
    setShowClearAll(false);
    toast.success('All data cleared');
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your preferences and data</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Export, import, or clear your tracking data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button onClick={handleExport} variant="outline" className="justify-start gap-2">
                <Download className="w-4 h-4" />
                Export JSON
              </Button>
              <Button onClick={handleImport} variant="outline" className="justify-start gap-2">
                <Upload className="w-4 h-4" />
                Import JSON
              </Button>
              <Button onClick={handlePrint} variant="outline" className="justify-start gap-2">
                <Printer className="w-4 h-4" />
                Print / Export PDF
              </Button>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <Button
                onClick={() => setShowClearMonth(true)}
                variant="outline"
                className="w-full justify-start gap-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 border-orange-500/20 hover:bg-orange-500/10"
              >
                <RefreshCw className="w-4 h-4" />
                Clear Current Month
              </Button>
              <Button
                onClick={() => setShowClearAll(true)}
                variant="outline"
                className="w-full justify-start gap-2 text-red-600 hover:text-red-700 dark:text-red-400 border-red-500/20 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle>Keyboard Shortcuts</CardTitle>
            <CardDescription>Navigate and interact efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Arrow Keys</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Navigate cells</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Space / Enter</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Toggle cell</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Shift + Click</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Fill range</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Right Click / Long Press</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Add note</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Click + Drag</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Fill multiple</kbd>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Trackora</strong></p>
              <p>A sleek habit and progress tracker to help you build better habits.</p>
              <p className="pt-2">
                <strong className="text-foreground">Features:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Custom protocols with color coding</li>
                <li>Interactive sleep tracker with visual graphs</li>
                <li>Weekly and monthly analytics</li>
                <li>Drag-to-fill and keyboard navigation</li>
                <li>Notes for each cell</li>
                <li>Export/Import data</li>
                <li>Print-friendly layout</li>
              </ul>
              <p className="text-xs text-muted mt-4">
                All data is stored locally in your browser. No data is sent to any server.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clear Month Dialog */}
      <AlertDialog open={showClearMonth} onOpenChange={setShowClearMonth}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Current Month?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all tracking data for the current month but keep your protocols. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearMonth} className="bg-orange-600 hover:bg-orange-700">
              Clear Month
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Dialog */}
      <AlertDialog open={showClearAll} onOpenChange={setShowClearAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your data including protocols and tracking history for all months. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-red-600 hover:bg-red-700">
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
