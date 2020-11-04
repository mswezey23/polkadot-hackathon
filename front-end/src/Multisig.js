import React, { useState, useEffect } from 'react';
import { Form, Input, Grid } from 'semantic-ui-react';
import { TxButton } from './substrate-lib/components';
import { useSubstrate } from './substrate-lib';
import { createKeyMulti, encodeAddress, sortAddresses } from '@polkadot/util-crypto';

export default function Main (props) {
  const [status, setStatus] = useState(null);
  const { setMultisigAddress, accountPair } = props;
  const [formState, setFormState] = useState({ threshold: 2, otherSignatories: '', remark: '' });
  const SS58Prefix = 42;

  const initialAddress = '';
  useEffect(() => {
    setMultisigAddress(initialAddress);
  }, [setMultisigAddress, initialAddress]);

  const onChange = (_, data) =>
    setFormState(prev => ({ ...prev, [data.state]: data.value }));

  const onMultisigParamChange = (_, data) => {
    let Ss58Address;
    if (data.value) {
       if (data.value.split(',').length > 1) {
        Ss58Address = createMultisig(data.value.split(','), threshold);
       } else {
         if (data.value >= 2 && data.value <= 10) {
          if (otherSignatories.split(',').length > 1) {
            Ss58Address = createMultisig(otherSignatories.split(','), data.value);
          }
         }
       }
    }
    if (Ss58Address) {
      setMultisigAddress(Ss58Address);
    }

    setFormState(prev => ({ ...prev, [data.state]: data.value }));
  }
  
  const { threshold, otherSignatories, remark } = formState;
  const { api } = useSubstrate();

  function createMultisig(signatories, threshold) {
    let Ss58Address;
    try {
      const sortedSignatories = sortAddresses(signatories, SS58Prefix);
      const multiAddress = createKeyMulti(sortedSignatories, threshold);
      Ss58Address = encodeAddress(multiAddress, SS58Prefix);
      console.log(`multisig address: ${Ss58Address}`);
    } catch (error) {
      console.log(`error! ${error}`);
    }

    return Ss58Address;
  }

  return (
    <Grid.Column width={8}>
      <h1>Multisig Creation</h1>
      <Form>
        <Form.Field>
          <Input
            fluid
            label='Remark'
            type='text'
            placeholder='Any data...'
            state='remark'
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label='Threshold'
            type='number'
            placeholder='Max as 10'
            state='threshold'
            onChange={onMultisigParamChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label='Signatories'
            type='text'
            placeholder='Addresses, separated by comma'
            state='otherSignatories'
            onChange={onMultisigParamChange}
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
            accountPair={accountPair}
            label='Submit'
            type='SIGNED-TX'
            setStatus={setStatus}
            attrs={{
              palletRpc: 'multisig',
              callable: 'asMulti',
              inputParams: [threshold, otherSignatories.split(','), null, api.tx.system.remark(remark), false, 1000000000],
              paramFields: [true, true, { optional: true }, true, true, true]
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}
