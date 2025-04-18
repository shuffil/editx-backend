router.post('/', upload.array('videos'), async (req, res) => {
  const files = req.files;
  const context = req.body.context || '';
  const sessionId = uuidv4();

  console.log(`✅ Upload received. Session: ${sessionId}, Files: ${files.length}`);
  console.log(`🧾 Received files:`, files.map(f => f.originalname));
  console.log(`🧠 Context: ${context}`);
  console.log(`📦 Session ID: ${sessionId}`);

  try {
    const sessionPath = path.join('uploads', sessionId);
    console.log(`📁 Creating session folder at: ${sessionPath}`);
    fs.mkdirSync(sessionPath, { recursive: true });

    for (const file of files) {
      const destination = path.join(sessionPath, file.originalname);
      console.log(`➡️ Moving file: ${file.path} → ${destination}`);
      fs.renameSync(file.path, destination);
    }

    console.log('✅ Files moved. Importing orchestrator...');
    const { startProcessing } = await import('../orchestrator.js');
    console.log('✅ Orchestrator module imported successfully');

    console.log(`🚀 Running startProcessing(${sessionId})`);
    await startProcessing(sessionId, context, files);

    res.json({ sessionId });
  } catch (err) {
    console.error(`❌ CRITICAL ERROR: ${err.stack}`);
    res.status(500).json({ error: 'Internal server error during upload.' });
  }
});
