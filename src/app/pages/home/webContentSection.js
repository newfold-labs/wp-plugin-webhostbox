import ActionField from "../../components/action-field";
import { Container } from "@newfold/ui-component-library";

const WebContentSection = () => {
	return (
		<Container.SettingsField
			title={__('Website Content', 'wp-plugin-webhostbox')}
			description={__('Create, manage & sort your story.', 'wp-plugin-webhostbox')}
		>
			<div className="nfd-flex nfd-flex-col nfd-gap-5">
				<ActionField
					label={__("Blog", 'wp-plugin-webhostbox')}
					buttonLabel={__("New Post", 'wp-plugin-webhostbox')}
					href={window.NewfoldRuntime.linkTracker.addUtmParams(window.NewfoldRuntime.adminUrl + 'post-new.php')}
					className={"wpwhb-app-home-blog-action"}
				>
					{__('Write a new blog post.', 'wp-plugin-webhostbox')}
				</ActionField>

				<ActionField
					label={__("Pages", 'wp-plugin-webhostbox')}
					buttonLabel={__("New Page", 'wp-plugin-webhostbox')}
					href={window.NewfoldRuntime.linkTracker.addUtmParams(window.NewfoldRuntime.adminUrl + 'post-new.php?post_type=page')}
					className={"wpwhb-app-home-pages-action"}
				>
					{__('Add fresh pages to your website.', 'wp-plugin-webhostbox')}
				</ActionField>

				<ActionField
					label={__("Categories", 'wp-plugin-webhostbox')}
					buttonLabel={__("Manage Categories", 'wp-plugin-webhostbox')}
					href={window.NewfoldRuntime.linkTracker.addUtmParams(window.NewfoldRuntime.adminUrl + 'edit-tags.php?taxonomy=category')}
					className={"wpwhb-app-home-categories-action"}
				>
					{__('Organize existing content into categories.', 'wp-plugin-webhostbox')}
				</ActionField>
			</div>
		</Container.SettingsField >
	);
};

export default WebContentSection;
