import React, { useEffect, useState } from 'react';
import { Table, Grid, Button } from 'semantic-ui-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSubstrate } from './substrate-lib';
import { Keyring } from '@polkadot/keyring';
import { createKeyMulti, encodeAddress, sortAddresses } from '@polkadot/util-crypto';

// bob, alice_stash
// 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty,5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY
// multisig address
// 5G1zUMhAa8DBeMQG9br6SkoNgkctoq9NqNygbYiEx5UWTYRE

const SS58Prefix = 42;
const keyring = new Keyring({ type: 'sr25519', ss58Format: SS58Prefix });

export default function Main (props) {
  const { api } = useSubstrate();
  const [balances, setBalances] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [accounts, setAccounts] = useState(keyring.getPairs());
  const { multisigAddress } = props;

  useEffect(() => {
    // Hackin it!
    if (multisigAddress) {
        console.log('address appended! ' + multisigAddress)
        addresses.push(multisigAddress);
        accounts.push({address: multisigAddress});
        console.log(accounts.length);
    }
    console.log('address not appended!')
    let unsubscribeAll = null;

    api.query.system.account
      .multi(addresses, balances => {
        const balancesMap = addresses.reduce((acc, address, index) => ({
          ...acc, [address]: balances[index].data.free.toHuman()
        }), {});
        setBalances(balancesMap);
      }).then(unsub => {
        unsubscribeAll = unsub;
      }).catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [multisigAddress, setBalances]);

  return (
    <Grid.Column>
      <h1>Multisig Balances</h1>
      <Table celled striped size='small'>
        <Table.Body>{accounts.map(account =>
          <Table.Row key={account.address}>
            <Table.Cell width={10}>
              <span style={{ display: 'inline-block', minWidth: '31em' }}>
                {account.address}
              </span>
              <CopyToClipboard text={account.address}>
                <Button
                  basic
                  circular
                  compact
                  size='mini'
                  color='blue'
                  icon='copy outline'
                />
              </CopyToClipboard>
            </Table.Cell>
            <Table.Cell width={3}>{
              balances && balances[account.address] &&
              balances[account.address]
            }</Table.Cell>
          </Table.Row>
        )}
        </Table.Body>
      </Table>
    </Grid.Column>
  );
}
