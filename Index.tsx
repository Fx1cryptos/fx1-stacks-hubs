import type { NextPage } from 'next';
import { useState } from 'react';
import { createHubOnChain, addMemberToHub } from '../utils/stacksClient';

const Home: NextPage = () => {
  const [hubName, setHubName] = useState('');
  const [hubId, setHubId] = useState(1);

  const handleCreateHub = async () => {
    try {
      await createHubOnChain(hubId, hubName || 'FX1 Hub');
      alert('Hub created!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async () => {
    const member = prompt('Enter member Stacks address');
    if (member) await addMemberToHub(hubId, member);
  };

  return (
    <div>
      <h1>FX1 Stacks Hubs</h1>
      <input placeholder="Hub Name" value={hubName} onChange={e => setHubName(e.target.value)} />
      <button onClick={handleCreateHub}>Create Hub</button>
      <button onClick={handleAddMember}>Add Member</button>
    </div>
  );
};

export default Home;
