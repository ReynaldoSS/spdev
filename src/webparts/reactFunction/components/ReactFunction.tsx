import * as React from 'react';
import type { IReactFunctionProps } from './IReactFunctionProps';
import { useState, useEffect } from 'react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

const ReactFunction: React.FC<IReactFunctionProps> = (props) => {
  const {
    currentSiteUrl,
    spHttpClient
  } = props;
  const [counter, setCounter] = useState<number>(1);
  const [evenOdd, setEvenOdd] = useState<string>('');
  const [siteList, setSiteList] = useState<string[]>([]);

  const onButtonClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (event.currentTarget.name === 'BtnMinus')
      setCounter(counter - 1);
    else
      setCounter(counter + 1);
  }

  useEffect(() => {
    const fetchLists = async (): Promise<void> => {
      try {
        const endpoint: string = `${currentSiteUrl}/_api/web/lists?$select=Title&$filter=Hidden eq false&$orderby=Title asc&$top=10`;
        const rawResponse: SPHttpClientResponse = await spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
        if (!rawResponse.ok) {
          const errorMessage = await rawResponse.text();
          throw new Error(`Erro na requisição: ${rawResponse.status} - ${errorMessage}`);
        }

        const jsonResponse = await rawResponse.json();
        if (jsonResponse.value) {
          setSiteList(jsonResponse.value.map((list: { Title: string }) => list.Title));
        }
      } catch (error) {
        console.error('Erro ao buscar as listas:', error);
      }
    };
    fetchLists().catch((error) => { console.error('Erro na função fetchLists:', error); });
  }, [currentSiteUrl, spHttpClient]
  );

  useEffect(() => {
    setEvenOdd(counter % 2 === 0 ? 'Even' : 'Odd');
  }, [counter]);

  return (
    <div>
      <div>Counter:<strong>{counter}</strong> is <strong>{evenOdd}</strong></div>
      <button name='BtnPlus' onClick={onButtonClick}>+</button>
      <button name='BtnMinus' onClick={onButtonClick}>-</button>
      <h1>Site Lists:</h1>
      <ul>
        {siteList.map((listTitle: string, index: number) => (
          <li key={index}>{listTitle}</li>
        ))}
      </ul>
    </div>
  );
}
export default ReactFunction;