import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FolderPlus, RefreshCw, Filter } from 'lucide-react';
import BookmarkCard from './BookmarkCard';
import BookmarkDialog, { BookmarkFormData } from './BookmarkDialog';
import FolderDialog, { FolderFormData } from './FolderDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string;
  color: string;
  preview_image: string | null;
  is_active: boolean;
  tags: string[];
  folder_id: string | null;
  display_order: number;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const SavedSection = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'bookmark' | 'folder' } | null>(null);
  const [draggedBookmark, setDraggedBookmark] = useState<string | null>(null);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    filterBookmarks();
  }, [bookmarks, selectedFolder, searchQuery, selectedTag]);

  const loadData = async () => {
    try {
      const [bookmarksRes, foldersRes] = await Promise.all([
        supabase.from('bookmarks').select('*').order('display_order'),
        supabase.from('bookmark_folders').select('*').order('display_order'),
      ]);

      if (bookmarksRes.error) throw bookmarksRes.error;
      if (foldersRes.error) throw foldersRes.error;

      setBookmarks(bookmarksRes.data || []);
      setFolders(foldersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const filterBookmarks = () => {
    let filtered = [...bookmarks];

    if (selectedFolder) {
      if (selectedFolder === 'none') {
        filtered = filtered.filter(b => !b.folder_id);
      } else {
        filtered = filtered.filter(b => b.folder_id === selectedFolder);
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        b =>
          b.title.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query) ||
          b.description?.toLowerCase().includes(query)
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(b => b.tags.includes(selectedTag));
    }

    setFilteredBookmarks(filtered);
  };

  const handleSaveBookmark = async (data: BookmarkFormData) => {
    try {
      const bookmarkData = {
        title: data.title,
        url: data.url,
        description: data.description,
        folder_id: data.folderId,
        icon: data.icon,
        color: data.color,
        preview_image: data.previewImage,
        tags: data.tags,
        user_id: user?.id,
      };

      if (editingBookmark) {
        const { error } = await supabase
          .from('bookmarks')
          .update(bookmarkData)
          .eq('id', editingBookmark.id);
        
        if (error) throw error;
        toast.success('Link atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert([bookmarkData]);
        
        if (error) throw error;
        toast.success('Link adicionado com sucesso');
      }

      setBookmarkDialogOpen(false);
      setEditingBookmark(null);
      loadData();
    } catch (error) {
      console.error('Error saving bookmark:', error);
      toast.error('Erro ao salvar link');
    }
  };

  const handleSaveFolder = async (data: FolderFormData) => {
    try {
      const folderData = {
        name: data.name,
        color: data.color,
        icon: data.icon,
        user_id: user?.id,
      };

      if (editingFolder) {
        const { error } = await supabase
          .from('bookmark_folders')
          .update(folderData)
          .eq('id', editingFolder.id);
        
        if (error) throw error;
        toast.success('Pasta atualizada');
      } else {
        const { error } = await supabase
          .from('bookmark_folders')
          .insert([folderData]);
        
        if (error) throw error;
        toast.success('Pasta criada');
      }

      setFolderDialogOpen(false);
      setEditingFolder(null);
      loadData();
    } catch (error) {
      console.error('Error saving folder:', error);
      toast.error('Erro ao salvar pasta');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'bookmark') {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('id', itemToDelete.id);
        
        if (error) throw error;
        toast.success('Link removido');
      } else {
        const { error } = await supabase
          .from('bookmark_folders')
          .delete()
          .eq('id', itemToDelete.id);
        
        if (error) throw error;
        toast.success('Pasta removida');
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Erro ao remover');
    }
  };

  const checkBookmarkStatus = async (bookmarkId: string, url: string) => {
    try {
      // Simplified check - in production, you'd want a proper backend check
      const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      const isActive = true; // Since we can't reliably check with no-cors
      
      await supabase
        .from('bookmarks')
        .update({ is_active: isActive, last_checked: new Date().toISOString() })
        .eq('id', bookmarkId);

      loadData();
      toast.success('Status verificado');
    } catch (error) {
      console.error('Error checking status:', error);
      toast.error('Erro ao verificar status');
    }
  };

  const allTags = Array.from(new Set(bookmarks.flatMap(b => b.tags)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Salvos</h2>
          <p className="text-muted-foreground mt-1">
            {filteredBookmarks.length} de {bookmarks.length} links
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setFolderDialogOpen(true)} variant="outline">
            <FolderPlus className="h-4 w-4 mr-2" />
            Nova Pasta
          </Button>
          <Button onClick={() => setBookmarkDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Link
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Select value={selectedFolder || 'all'} onValueChange={(v) => setSelectedFolder(v === 'all' ? null : v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas as pastas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as pastas</SelectItem>
            <SelectItem value="none">Sem pasta</SelectItem>
            {folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: folder.color }} />
                  {folder.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {allTags.length > 0 && (
          <Select value={selectedTag || 'all'} onValueChange={(v) => setSelectedTag(v === 'all' ? null : v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas as tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Active Tags */}
      {(selectedFolder || selectedTag) && (
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {selectedFolder && selectedFolder !== 'none' && (
            <Badge variant="secondary" className="gap-1">
              {folders.find(f => f.id === selectedFolder)?.name}
              <button onClick={() => setSelectedFolder(null)} className="ml-1">×</button>
            </Badge>
          )}
          {selectedTag && (
            <Badge variant="secondary" className="gap-1">
              {selectedTag}
              <button onClick={() => setSelectedTag(null)} className="ml-1">×</button>
            </Badge>
          )}
        </div>
      )}

      {/* Bookmarks Grid */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            {bookmarks.length === 0 ? 'Nenhum link salvo ainda' : 'Nenhum link encontrado com os filtros aplicados'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              id={bookmark.id}
              title={bookmark.title}
              url={bookmark.url}
              description={bookmark.description || undefined}
              icon={bookmark.icon}
              color={bookmark.color}
              previewImage={bookmark.preview_image || undefined}
              isActive={bookmark.is_active}
              tags={bookmark.tags}
              onEdit={() => {
                setEditingBookmark(bookmark);
                setBookmarkDialogOpen(true);
              }}
              onDelete={() => {
                setItemToDelete({ id: bookmark.id, type: 'bookmark' });
                setDeleteDialogOpen(true);
              }}
              onDragStart={(e) => {
                setDraggedBookmark(bookmark.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragEnd={() => {
                setDraggedBookmark(null);
              }}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <BookmarkDialog
        open={bookmarkDialogOpen}
        onOpenChange={(open) => {
          setBookmarkDialogOpen(open);
          if (!open) setEditingBookmark(null);
        }}
        onSave={handleSaveBookmark}
        folders={folders}
        initialData={editingBookmark ? {
          title: editingBookmark.title,
          url: editingBookmark.url,
          description: editingBookmark.description || '',
          folderId: editingBookmark.folder_id,
          icon: editingBookmark.icon,
          color: editingBookmark.color,
          previewImage: editingBookmark.preview_image || '',
          tags: editingBookmark.tags,
        } : undefined}
      />

      <FolderDialog
        open={folderDialogOpen}
        onOpenChange={(open) => {
          setFolderDialogOpen(open);
          if (!open) setEditingFolder(null);
        }}
        onSave={handleSaveFolder}
        initialData={editingFolder ? {
          name: editingFolder.name,
          color: editingFolder.color,
          icon: editingFolder.icon,
        } : undefined}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este {itemToDelete?.type === 'bookmark' ? 'link' : 'pasta'}?
              {itemToDelete?.type === 'folder' && ' Os links dentro dela não serão excluídos.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SavedSection;