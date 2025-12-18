import * as React from 'react';
import styles from './Crud.module.scss';
import type { ICrudProps } from './ICrudProps';
import * as api from '../services/CRUDServices';
import { useEffect, useState } from 'react';
// Importamos Spinner e SpinnerSize
import { Panel, PrimaryButton, DefaultButton, TextField, Stack, Spinner, SpinnerSize } from '@fluentui/react';

const Crud: React.FC<ICrudProps> = (props) => {

  const [items, setItems] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false); // Novo estado para o salvamento
  const [inputValue, setInputValue] = useState<string>('');
  const [idSelecionado, setIdSelecionado] = useState<number | null>(null);

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
    
    setIsSaving(true); // Inicia o estado de salvamento
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
      setIsSaving(false); // Finaliza o estado de salvamento
    }
  }

  const onDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await api.deleteItem(id);
      await refreshData();
    }
  }

  return (
    <div className={styles.crud}>
      <h3 className={styles.listTitle}>List Items</h3>
      <PrimaryButton onClick={onNew} text="New" iconProps={{ iconName: 'Add' }} />
      
      {/* Spinner principal para o carregamento da lista */}
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
                  onClick={() => onDelete(item.Id)} 
                  text='Delete' 
                  styles={{ root: { color: 'red', marginLeft: '8px' } }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Panel
        isOpen={isOpen}
        // Bloqueia fechar o modal enquanto estiver salvando
        onDismiss={() => !isSaving && setIsOpen(false)}
        headerText={idSelecionado ? 'Edit Item' : 'New Item'}
        closeButtonAriaLabel='Close'
      >
        <Stack tokens={{ childrenGap: 15 }} className={styles.crudPanel}>
          {isSaving ? (
            // Exibe o Spinner dentro do painel durante o salvamento
            <Spinner size={SpinnerSize.large} label="Saving your changes..." style={{ marginTop: '40px' }} />
          ) : (
            // Exibe o formulário normalmente se não estiver salvando
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