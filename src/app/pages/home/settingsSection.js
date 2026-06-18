import ActionField from "../../components/action-field";
import { Container } from "@newfold/ui-component-library";

const SettingsSection = () => {
	return (
		<Container.SettingsField
			title={__('Settings and Performance', 'wp-plugin-webhostbox')}
			description={__('Customize & fine-tune your site.', 'wp-plugin-webhostbox')}
		>
			<div className="nfd-flex nfd-flex-col nfd-gap-5">
				<ActionField
					label={__("Manage Settings", 'wp-plugin-webhostbox')}
					buttonLabel={__("Settings", 'wp-plugin-webhostbox')}
					href={window.NewfoldRuntime.linkTracker.addUtmParams(`admin.php?page=webhostbox#/settings`)}
					className={"wpwhb-app-home-settings-action"}
				>
					{__('Manage your site settings. You can ajdust automatic updates, comments, revisions and more.', 'wp-plugin-webhostbox')}
				</ActionField>

				<ActionField
					label={__("Performance", 'wp-plugin-webhostbox')}
					buttonLabel={__("Performance", 'wp-plugin-webhostbox')}
					href={window.NewfoldRuntime.linkTracker.addUtmParams(`admin.php?page=webhostbox#/settings/performance`)}
					className={"wpwhb-app-home-performance-action"}
				>
					{__('Manage site performance and caching settings as well as clear the site cache.', 'wp-plugin-webhostbox')}
				</ActionField>

				<ActionField
					label={__("Marketplace", 'wp-plugin-webhostbox')}
					buttonLabel={__("Visit Marketplace", 'wp-plugin-webhostbox')}
					href={window.NewfoldRuntime.linkTracker.addUtmParams(`admin.php?page=webhostbox#/marketplace`)}
					className={"wpwhb-app-home-marketplace-action"}
				>
					{__('Add site services, themes or plugins from the marketplace.', 'wp-plugin-webhostbox')}
				</ActionField>
			</div>
		</Container.SettingsField >
	);
};

export default SettingsSection;
