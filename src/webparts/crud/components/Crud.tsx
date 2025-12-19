import * as React from 'react';
import styles from './Crud.module.scss';
import type { ICrudProps } from './ICrudProps';
import * as api from '../services/CRUDServices';
import { useEffect, useState } from 'react';
// Adicionado Dialog e DialogType
import { 
  Panel, 
  PrimaryButton, 
  DefaultButton, 
  TextField, 
  Stack, 
  Spinner, 
  SpinnerSize, 
  Dialog, 
  DialogType, 
  DialogFooter 
} from '@fluentui/react';

const Crud: React.FC<ICrudProps> = (props) => {

  const [items, setItems] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [idSelecionado, setIdSelecionado] = useState<number | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const refreshData = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await api.getItems();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshData();
  }, []);

  const onNew = () => {
    setIdSelecionado(null);
    setInputValue('');
    setIsOpen(true);
  }

  const onSelect = (item: { Id: number, Title: string }) => {
    setIdSelecionado(item.Id);
    setInputValue(item.Title);
    setIsOpen(true);
  }

  const onSave = async () => {
    if (!inputValue) return;
    setIsSaving(true);
    try {
      if (idSelecionado) {
        await api.updateItem(idSelecionado, inputValue);
      } else {
        await api.createItem(inputValue);
      }
      setInputValue('');
      setIsOpen(false);
      await refreshData();
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setIsSaving(false);
    }
  }

  const openDeleteDialog = (id: number) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setItemToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    if (itemToDelete !== null) {
      setLoading(true); // Opcional: mostrar spinner na lista enquanto deleta
      try {
        await api.deleteItem(itemToDelete);
        closeDeleteDialog();
        await refreshData();
      } catch (error) {
        console.error("Error deleting item:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.crud}>
      <h3 className={styles.listTitle}>List Items</h3>
      <PrimaryButton onClick={onNew} text="New" iconProps={{ iconName: 'Add' }} />
      
      {loading ? (
        <Spinner size={SpinnerSize.large} label="Loading data..." style={{ marginTop: '20px' }} />
      ) : (
        <ul className={styles.list}>
          {items.map(item => (
            <li key={item.Id} className={styles.listItem}>
              <span>{item.Title}</span>
              <div>
                <DefaultButton onClick={() => onSelect(item)} text="Select" />
                <DefaultButton 
                  onClick={() => openDeleteDialog(item.Id)} // Chama o Dialog em vez do confirm()
                  text='Delete' 
                  styles={{ root: { color: 'red', marginLeft: '8px' } }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      <Dialog
        hidden={!isDeleteDialogOpen}
        onDismiss={closeDeleteDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Delete Confirmation',
          subText: 'Are you sure you want to delete this item? This action is permanent.'
        }}
        modalProps={{ isBlocking: true }}
      >
        <DialogFooter>
          <PrimaryButton 
            onClick={handleDelete} 
            text="Yes, Delete" 
            styles={{ root: { backgroundColor: '#d13438', border: 'none' } }} 
          />
          <DefaultButton onClick={closeDeleteDialog} text="Cancel" />
        </DialogFooter>
      </Dialog>

      <Panel
        isOpen={isOpen}
        onDismiss={() => !isSaving && setIsOpen(false)}
        headerText={idSelecionado ? 'Edit Item' : 'New Item'}
        closeButtonAriaLabel='Close'
      >
        <Stack tokens={{ childrenGap: 15 }} className={styles.crudPanel}>
          {isSaving ? (
            <Spinner size={SpinnerSize.large} label="Saving your changes..." style={{ marginTop: '40px' }} />
          ) : (
            <>
              <TextField
                label='Title'
                value={inputValue}
                onChange={(e, newValue) => setInputValue(newValue || '')}
                placeholder='Enter new title'
                required
              />
              <Stack horizontal tokens={{ childrenGap: 10 }}>
                <PrimaryButton onClick={onSave} text='Save' />
                <DefaultButton onClick={() => setIsOpen(false)} text='Cancel' />
              </Stack>
            </>
          )}
        </Stack>
      </Panel>
    </div>
  );
}

export default Crud;