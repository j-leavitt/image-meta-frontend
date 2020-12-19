import React, { Component } from 'react';
import camelCase from 'lodash/camelCase';
import { Heading, Form, Workbench, Paragraph } from '@contentful/forma-36-react-components';
import { css } from 'emotion';

import { styles } from './styles';

import { InstallationContent } from './InstallationContent';
import { ConfigurationContent } from './ConfigurationContent';

const makeContentType = (contentTypeId, contentTypeName) => ({
  sys: {
    id: contentTypeId
  },
  name: contentTypeName,
  displayField: 'title',
  fields: [
    {
      id: 'title',
      name: 'Title',
      required: true,
      type: 'Symbol'
    },
    {
      id: 'image',
      name: 'Image',
      required: true,
      type: 'Link',
      linkType: 'Asset'
    },
    {
      id: 'altText',
      name: 'Alt text',
      type: 'Symbol'
    },
    {
      id: 'caption',
      name: 'Caption',
      type: 'Text'
    },
    {
      id: 'description',
      name: 'Description',
      type: 'Text'
    },
    {
      id: 'height',
      name: 'Height',
      type: 'Integer'
    },
    {
      id: 'width',
      name: 'Width',
      type: 'Integer'
    }
  ]
});

export class AppView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parameters: {},
      isInstalled: false,
      allContentTypesIds: [],
      contentTypeId: 'photoWithMeta',
      contentTypeName: 'Photo with Meta',
      isContentTypeIdPristine: true
    };

    // `onConfigure` allows to configure a callback to be
    // invoked when a user attempts to install the app or update
    // its configuration.
    props.sdk.app.onConfigure(() => this.onConfigure());
  }

  async componentDidMount() {
    const { space, app } = this.props.sdk;

    // Get installed state, content types, and current paramaters
    // If the app is not installed yet, `parameters` will be `null`.
    const [isInstalled, allContentTypes, parameters] = await Promise.all([
      app.isInstalled(),
      space.getContentTypes(),
      app.getParameters()
    ]);

    const allContentTypesIds = allContentTypes.items.map(({ sys: { id } }) => id);

    this.setState(parameters ? { isInstalled, allContentTypesIds, parameters } : { isInstalled, allContentTypesIds }, () => {
      // Once preparation has finished, call `setReady` to hide
      // the loading screen and present the app to a user.
      this.props.sdk.app.setReady();
    });

    app.onConfigurationCompleted(err => {
      if (!err) {
        this.setState({ isInstalled: true });
      }
    });
  }

  onConfigure = async () => {
    // This method will be called when a user clicks on "Install"
    // or "Save" in the configuration screen.
    // for more details see https://www.contentful.com/developers/docs/extensibility/ui-extensions/sdk-reference/#register-an-app-configuration-hook

    // Get current the state of EditorInterface and other entities
    // related to this app installation
    // const currentState = await this.props.sdk.app.getCurrentState();

    const { sdk } = this.props;
    const { isInstalled, allContentTypesIds, contentTypeId, contentTypeName } = this.state;

    if (isInstalled) {
      sdk.notifier.success('The app is already fully configured.');
      return false;
    }

    if (!contentTypeName) {
      sdk.notifier.error('Provide a name for the content type.');
      return false;
    }

    const isContentTypeIdTaken = allContentTypesIds.includes(contentTypeId);
    if (isContentTypeIdTaken) {
      sdk.notifier.error(
        `ID "${contentTypeId}" is taken. Try a different name for the content type`
      );
      return false;
    }

    let contentType = null;
    try {
      const data = makeContentType(contentTypeId, contentTypeName);
      contentType = await sdk.space.createContentType(data);
    } catch (error) {
      sdk.notifier.error(`Failed to create content type "${contentTypeName}"`);
      return false;
    }

    // Set the newly created content type's state to "Published"
    try {
      await sdk.space.updateContentType(contentType);
    } catch (error) {
      sdk.notifier.error(`Failed to publish content type "${contentTypeName}"`);
      return false;
    }

    return {
      // Parameters to be persisted as the app configuration.
      parameters: this.state.parameters,
      // In case you don't want to submit any update to app
      // locations, you can just pass the currentState as is
      targetState: {
        EditorInterface: {
          [contentType.sys.id]: {
            sidebar: { position: 1 }
          }
        }
      }
    };
  };

  onContentTypeNameChange = ({ target: { value } }) =>
    this.setState(oldState => ({
      ...(oldState.isContentTypeIdPristine && { contentTypeId: camelCase(value) }),
      contentTypeName: value
    }));

  onContentTypeIdChange = ({ target: { value } }) =>
    this.setState({
      isContentTypeIdPristine: false,
      contentTypeId: value
    });

  render() {
    const { isInstalled, allContentTypesIds, contentTypeId, contentTypeName } = this.state;

    return (
      <Workbench className={css({ margin: '80px' })}>
        <Form>
          <Heading className={styles.heading}>About Image Meta</Heading>
          <Paragraph>
            The Image Meta app automatically populates entry fields using metadata read from the associated image file.
          </Paragraph>
          {isInstalled && <ConfigurationContent />}
          {!isInstalled && (
            <InstallationContent
              allContentTypesIds={allContentTypesIds}
              contentTypeId={contentTypeId}
              contentTypeName={contentTypeName}
              onContentTypeNameChange={this.onContentTypeNameChange}
              onContentTypeIdChange={this.onContentTypeIdChange}
            />
          )}
        </Form>
      </Workbench>
    );
  }
}
