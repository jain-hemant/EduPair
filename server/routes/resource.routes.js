import * as resourceController from '##/server/controllers/resource.controller.js';
import { isAllowed } from '##/server/policies/api.policies.js';
import { withAsyncErrorHandling } from '##/server/utility/utility.js';

export default function routes(app) {
    // Create a new resource with file upload
    app
        .route('/api/resources')
        .all(isAllowed)
        .post(
            resourceController.handleFileUpload,
            withAsyncErrorHandling(resourceController.createResource)
        );

    // Get all resources with filters
    app
        .route('/api/resources')
        .get(withAsyncErrorHandling(resourceController.getAllResources));

    // Get resource by ID
    app
        .route('/api/resources/:resourceId')
        .get(withAsyncErrorHandling(resourceController.getResourceById));

    // Update resource with file upload
    app
        .route('/api/resources/:resourceId')
        .all(isAllowed)
        .patch(
            resourceController.handleFileUpload,
            withAsyncErrorHandling(resourceController.updateResource)
        );

    // Delete resource
    app
        .route('/api/resources/:resourceId')
        .all(isAllowed)
        .delete(withAsyncErrorHandling(resourceController.deleteResource));

    // Access a resource (spend credits)
    app
        .route('/api/resources/:resourceId/access')
        .all(isAllowed)
        .post(withAsyncErrorHandling(resourceController.accessResource));

    // Get resources created by current user
    app
        .route('/api/resources/my-created')
        .all(isAllowed)
        .get(withAsyncErrorHandling(resourceController.getMyCreatedResources));

    // Get resources accessed by current user
    app
        .route('/api/resources/my-accessed')
        .all(isAllowed)
        .get(withAsyncErrorHandling(resourceController.getMyAccessedResources));
}