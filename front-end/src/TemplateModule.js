import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  // The transaction submission status
  const [status, setStatus] = useState('');

  // The currently stored value
  const [currentName, setCurrentName] = useState('');
  const [formName, setFormName] = useState('');
  const [currentAgree, setCurrentAgree] = useState(false);
  const [formAgree, setFormAgree] = useState(false);

  useEffect(() => {
    let unsubscribe;
    api.query.templateModule.councilmembers(newValue => {
      // The storage value is an Option<u32>
      // So we have to check whether it is None first
      // There is also unwrapOr
      if (newValue.isNone) {
        setCurrentName('<None>');
        setCurrentAgree(false);
      } else {
        setCurrentName(newValue.Name.toHuman());
        setCurrentAgree(newValue.Agree);
      }
    }).then(unsub => {
      unsubscribe = unsub;
    })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api.query.templateModule]);

  return (
    <Grid.Column width={8}>
      <h1>Template Module - Modified</h1>
      <Card centered>
        <Card.Content textAlign='center'>
          <Card.Content textAlign='center'>
            <Card.Header content={`name: ${currentName}`} />
          </Card.Content>
          <Card.Content extra>TOS Agree? {currentAgree.toString()}</Card.Content>
        </Card.Content>
      </Card>
      <Form>
        <Form.Field>
          <Input
            label='Name'
            state='newValue'
            type='string'
            onChange={(_, { value }) => setFormName(value)}
          />
        </Form.Field>
        <Form.Field>
          <Input
            label='Agree'
            state='newValue'
            type='bool'
            onChange={(_, { value }) => setFormAgree(value)}
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
            accountPair={accountPair}
            label='Join Council as member'
            type='SIGNED-TX'
            setStatus={setStatus}
            attrs={{
              palletRpc: 'templateModule',
              callable: 'add_council_member',
              inputParams: [{ Name: formName, Agree: formAgree }],
              paramFields: [true]
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function TemplateModule (props) {
  const { api } = useSubstrate();
  return (api.query.templateModule && api.query.templateModule.add_council_member
    ? <Main {...props} /> : null);
}
