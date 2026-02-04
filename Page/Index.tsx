import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { createHubOnChain, addMemberToHub } from '../utils/stacksClient';

const Home: NextPage = () => {
  const [hubName, setHubName] = useState('');
  const [hubId, setHubId] = useState(1);

  const handleCreateHub = async () => {
    try {
      await createHubOnChain(hubId, hubName || 'FX1 Hub');
      alert('Hub created on Stacks!');
    } catch (err) {
      console.error(err);
      alert('Error creating hub');
    }
  };

  const handleAddMember = async () => {
    const member = prompt('Enter member Stacks address');
    if (member) await addMemberToHub(hubId, member);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '2rem', textAlign: 'center' }}>
      <Head>
        <title>FX1 Stacks Hubs</title>
      </Head>
      <header>
        <h1>FX1 Stacks Hubs</h1>
        <p>Build and manage digital hubs on Stacks blockchain</p>
      </header>
      <main style={{ marginTop: '2rem' }}>
        <input
          type="text"
          placeholder="Hub Name"
          value={hubName}
          onChange={(e) => setHubName(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <div style={{ marginTop: '1rem' }}>
          <button onClick={handleCreateHub} style={{ padding: '0.5rem 1rem', marginRight: '1rem' }}>
            Create Hub
          </button>
          <button onClick={handleAddMember} style={{ padding: '0.5rem 1rem' }}>
            Add Member
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
