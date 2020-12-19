import React from 'react';
import { List, ListItem, Heading, Paragraph } from '@contentful/forma-36-react-components';

import { styles } from './styles'

export const ConfigurationContent = () => (
  <>
    <Heading className={styles.heading}>Getting started</Heading>
    <Paragraph>Follow these steps to create a new image entry with automatically populated metadata:</Paragraph>
    <List className={styles.list}>
      <ListItem>Go to the &quot;Content&quot; page</ListItem>
      <ListItem>
        Create a new entry of type &quot;Photo with Meta&quot; (or the name you chose during
        the installation)
      </ListItem>
      <ListItem>Select an image to associate with the entry</ListItem>
      <ListItem>In the entry sidebar, click the &quot;Autofill Metadata&quot; button</ListItem>
    </List>

    <hr className={styles.splitter} />

    <Heading>Uninstallation and cleanup</Heading>
    <Paragraph>
      If you uninstall the Image Meta app you will have to manually clean up the content type
      we created for you during the installation. To do that follow these steps:
    </Paragraph>
    <List>
      <ListItem>Go to the &quot;content&quot; page</ListItem>
      <ListItem>
        Delete any entries of type &quot;Photo with Meta&quot; (or the name you chose during
        installation)
      </ListItem>
      <ListItem>Go to the &quot;content model&quot; page</ListItem>
      <ListItem>
        Edit the content type the app created, select &quot;actions&quot; from the top menu and
        &quot;delete&quot;
      </ListItem>
    </List>
  </>
);