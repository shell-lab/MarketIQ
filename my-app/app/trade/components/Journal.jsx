"use client";

import React from 'react';

export default function Journal({ addJournalEntry, journalEntries }) {
  const renderJournal = () => {
    if (journalEntries.length === 0) {
        return <li className="text-gray-500 text-sm">No journal entries.</li>;
    }
    return journalEntries.map(entry => (
        <li key={entry.id} className="bg-gray-100 p-3 rounded-lg text-sm">
            <p>{entry.note}</p>
            <span className="text-xs text-gray-400">{new Date(entry.createdAt.toDate()).toLocaleString()}</span>
        </li>
    ));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-3">Trade Journal</h2>
      <form className="mb-4" onSubmit={addJournalEntry}>
        <textarea
          id="journalInput"
          rows="3"
          className="w-full bg-white text-gray-800 p-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add a note about your trades..."
        ></textarea>
        <button
          type="submit"
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          Save Note
        </button>
      </form>
      <ul className="space-y-3 max-h-60 overflow-y-auto">
        {renderJournal()}
      </ul>
    </div>
  );
}