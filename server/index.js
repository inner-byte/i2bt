app.put('/api/members/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, avatar, bio, skills, projects, socialLinks } = req.body;

    const updatedMember = await Member.findOneAndUpdate(
      { uid: id },
      { 
        name, 
        email, 
        role, 
        avatar, 
        bio, 
        skills, 
        projects, 
        socialLinks 
      },
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(updatedMember);
  } catch (error) {
    res.status(500).json({ message: 'Error updating member', error: error.message });
  }
});