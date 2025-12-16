import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'ReactQueryWebPartStrings';
import ReactQuery from './components/ReactQuery';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export interface IReactQueryWebPartProps {
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:1000*60*5, // 5 minutes
    },
  },
});

export default class ReactQueryWebPart extends BaseClientSideWebPart<IReactQueryWebPartProps> {

  public render(): void {
    const element: React.ReactElement = React.createElement(
      QueryClientProvider,
      {
        client: queryClient
      },
      React.createElement(ReactQuery,
      {
        currentSiteUrl: this.context.pageContext.web.absoluteUrl,
        spHttpClient: this.context.spHttpClient
      })
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
