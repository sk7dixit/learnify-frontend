// src/services/badgeService.js
export const allBadges = {
    // Admin Only
    developer: { name: 'Developer', symbol: '💻', description: 'The creator of OriNotes.' },

    // Upload Activity
    first_uploader: { name: 'First Uploader', symbol: '🥇', description: 'Awarded for uploading your very first note.' },
    note_master: { name: 'Note Master', symbol: '🎓', description: 'Awarded for uploading 10 or more notes.' },
    knowledge_vault: { name: 'Knowledge Vault', symbol: '🏛️', description: 'Awarded for uploading 25 or more notes.' },
    archive_builder: { name: 'Archive Builder', symbol: '📚', description: 'A true legend, awarded for uploading 100 or more notes.' },

    // Quality / Ratings
    five_star_creator: { name: '5-Star Creator', symbol: '🌟', description: 'Awarded when your notes achieve an average rating of 5.0.' },
    trusted_author: { name: 'Trusted Author', symbol: '✍️', description: 'Awarded for consistently receiving positive reviews.' },

    // Community & Interaction
    reviewer: { name: 'Reviewer', symbol: '🧐', description: 'Awarded for reviewing and rating 10 or more notes.' },

    // Milestone / Progress
    og_member: { name: 'OG Member', symbol: '⏳', description: 'Joined in the early days of OriNotes.' },
    loyal_learner: { name: 'Loyal Learner', symbol: '💖', description: 'For being an active member for over 6 months.' },

    // Special / Fun Badges
    midnight_scholar: { name: 'Midnight Scholar', symbol: '🌙', description: 'For uploading a note after midnight.' },
    early_bird: { name: 'Early Bird', symbol: '☀️', description: 'For uploading a note before 7 AM.' },
};

