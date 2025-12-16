import * as React from 'react';
import type { IReactQueryProps } from './IReactQueryProps';
import { useQuery } from '@tanstack/react-query';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

const ReactQuery: React.FC<IReactQueryProps> = (props) => {

  const {
    currentSiteUrl,
    spHttpClient
  } = props;

  const { data, isLoading, isError, error } = useQuery(['lists', currentSiteUrl], async () => {
    const endpoint = `${currentSiteUrl}/_api/web/lists?$select=Title&$filter=Hidden eq false&$orderby=Title asc&$top=10`;
    const rawResponse: SPHttpClientResponse = await spHttpClient.get(endpoint, SPHttpClient.configurations.v1);

    if (!rawResponse.ok) {
      const errorMessage = await rawResponse.text();
      throw new Error(`Erro na requisição: ${rawResponse.status} - ${errorMessage}`);
    }

    const jsonResponse = await rawResponse.json();
    return jsonResponse.value.map((list: { Title: string }) => list.Title);
  },
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 2 // número de tentativas em caso de falha
    }
  );
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {(error as Error).message}</div>;
  }

  return (
    <div>
      <h1>Site Lists:</h1>
      <ul>
        {data && data.map((listTitle: string, index: number) => (
          <li key={index}>{listTitle}</li>
        ))}
      </ul>
    </div>
  );
}

export default ReactQuery;
