import './Devnet.css';
import { Eip1193Provider, Provider } from 'ethers';
import Form from '../Form/Form.tsx';
export type DevnetProps = {
  account: string;
  provider: Eip1193Provider;
  readOnlyProvider: Provider;
};

export const Devnet = ({
  account,
  provider,
  readOnlyProvider

}: any) => {

  return (
    <div className="flex flex-col items-center mt-10">
      <Form account={account} provider={provider} readOnlyProvider={readOnlyProvider} />
      {/* <Analysis account={account} provider={provider} readOnlyProvider={readOnlyProvider} /> */}
    </div>
  )
};
