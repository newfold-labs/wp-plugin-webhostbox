import ActionField from "../../components/action-field";
import { Container } from "@newfold/ui-component-library";

const WebHostingSection = () => {
	return (
		<Container.SettingsField
			title={__('WebHostBox Hosting', 'wp-plugin-webhostbox')}
			description={__('Access & manage your WebHostBox account.', 'wp-plugin-webhostbox')}
		>
			<div className="nfd-flex nfd-flex-col nfd-gap-5">
				<ActionField
					label={__("Manage WebHostBox Account", 'wp-plugin-webhostbox')}
					buttonLabel={__("Manage WebHostBox Account", 'wp-plugin-webhostbox')}
					href={
						`https://www.webhostbox.com/login?` +
						`&utm_campaign=` +
						`&utm_content=home_hosting_sites_link` +
						`&utm_term=manage_sites` +
						`&utm_medium=brand_plugin` +
						`&utm_source=wp-admin/admin.php?page=webhostbox#/home`
					}
					target="_blank"
					className={"wpwhb-app-home-sites-action"}
				>
					{__("Manage WebHostBox account products, options and billing.", 'wp-plugin-webhostbox')}
				</ActionField>
			</div>
		</Container.SettingsField>
	);
};

export default WebHostingSection;
