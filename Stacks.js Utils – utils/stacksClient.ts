import { StacksTestnet } from '@stacks/network';
import { openContractCall } from '@stacks/connect';

export const network = new StacksTestnet();

export const createHubOnChain = async (hubId: number, hubName: string) => {
  return openContractCall({
    contractAddress: 'ST1...YOUR_ADDRESS',
    contractName: 'fx1-hub',
    functionName: 'create-hub',
    functionArgs: [hubId, hubName],
    network,
    appDetails: { name: 'FX1 Stacks Hubs', icon: '/logo.png' },
  });
};

export const addMemberToHub = async (hubId: number, member: string) => {
  return openContractCall({
    contractAddress: 'ST1...YOUR_ADDRESS',
    contractName: 'fx1-hub',
    functionName: 'add-member',
    functionArgs: [hubId, member],
    network,
    appDetails: { name: 'FX1 Stacks Hubs', icon: '/logo.png' },
  });
};
