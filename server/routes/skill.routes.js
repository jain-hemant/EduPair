import * as skillController from '##/server/controllers/skill.controller.js';
import { isAllowed } from '##/server/policies/api.policies.js';
import { withAsyncErrorHandling } from '##/server/utility/utility.js';

export default function routes(app) {
    // Create a new skill (admin only)
    app
        .route('/api/skills')
        .all(isAllowed)
        .post(withAsyncErrorHandling(skillController.createSkill));

    // Get all skills
    app
        .route('/api/skills')
        .get(withAsyncErrorHandling(skillController.getAllSkills));

    // Get skill by ID
    app
        .route('/api/skills/:skillId')
        .get(withAsyncErrorHandling(skillController.getSkillById));

    // Update skill (admin only)
    app
        .route('/api/skills/:skillId')
        .all(isAllowed)
        .patch(withAsyncErrorHandling(skillController.updateSkill));

    // Delete skill (admin only)
    app
        .route('/api/skills/:skillId')
        .all(isAllowed)
        .delete(withAsyncErrorHandling(skillController.deleteSkill));

    // Get skills grouped by category
    app
        .route('/api/skills/category/grouped')
        .get(withAsyncErrorHandling(skillController.getSkillsByCategory));
}