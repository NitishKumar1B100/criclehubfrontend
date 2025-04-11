const PrivacyPolicy = () => {
  return (
    <div className="w-full px-6 py-10 text-gray-200 bg-gray-900 h-full overflow-y-auto rounded-xl hidesilder">
      <h1 className="text-3xl font-bold text-white mb-6">🔐 Privacy Policy</h1>
      <p className="text-sm mb-8">Effective Date: <span className="text-blue-400">11-04-2025</span></p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-red-400 mb-2">1. Information We Collect</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li><strong>Google Account Info:</strong> Name, Email, and Profile Picture via Firebase Authentication.</li>
          <li><strong>Usage Data:</strong> Includes chat logs, call data, and rooms joined/created.</li>
          <li><strong>Device Info:</strong> IP address, device type, browser, OS etc.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-red-400 mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Authenticate and personalize your account.</li>
          <li>Display your name and profile picture inside chats and calls.</li>
          <li>Provide real-time features like chat, call, and room interactions.</li>
          <li>Improve app functionality and protect against abuse.</li>
          <li><span className="text-green-400 font-semibold">We do NOT use your data for advertising.</span></li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-red-400 mb-2">3. Services We Integrate</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li><strong>Firebase:</strong> Authentication and Firestore Database (real-time chat).</li>
          <li><strong>Agora:</strong> Real-time voice and video calling.</li>
          <li><strong>Socket.IO:</strong> Enables real-time messaging.</li>
          <li><strong>React + Node.js:</strong> For frontend and backend infrastructure.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-red-400 mb-2">4. Data Sharing</h2>
        <p className="text-gray-300">
          We do <span className="text-red-500 font-bold">NOT</span> sell or rent your personal data.
          Your data is only shared with trusted services like Firebase and Agora to power essential features.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-red-400 mb-2">5. Data Retention & Deletion</h2>
        <p className="text-gray-300 mb-4">
          You can request to delete your account at any time. Upon deletion:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Your chats, calls, and personal information will be permanently erased.</li>
          <li>Your followers and following will also be removed.</li>
          <li>You will no longer be discoverable by other users.</li>
          <li className="text-red-400 font-bold">This action is irreversible.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-red-400 mb-2">6. Security</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>We use HTTPS for secure data transmission.</li>
          <li>Google OAuth and Firestore security rules to protect access.</li>
          <li>All communication with Socket.IO and Agora is encrypted.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-red-400 mb-2">7. Children's Privacy</h2>
        <p className="text-gray-300">
          CircleHub is not intended for users under 13. If we detect data from a child, we will remove it immediately.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-red-400 mb-2">8. Your Rights</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>View or request deletion of your personal data.</li>
          <li>Withdraw consent anytime by deleting your account.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-red-400 mb-2">9. Changes to Policy</h2>
        <p className="text-gray-300">
          We may update this Privacy Policy. You will be notified of any changes via the app. Continued use means acceptance.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-red-400 mb-2">10. Contact Us</h2>
        <p className="text-gray-300">
          Have questions or need support? Reach us at <span className="text-blue-400">nitishkumar235969@gmail.com</span>.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
