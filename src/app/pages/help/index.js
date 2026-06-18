import { 
	Button,
	Card,
	Container,
	Page,
	Title
} from "@newfold/ui-component-library";
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import help from 'App/data/help';

const HelpCard = ({ item }) => {
	return ( 
		<Card className={`wpwhb-help-card card-help-${item.name}`}>
			<Card.Content>
				<Title 
					as="h3" 
					size="4"
					className="nfd-mb-2"	
				>{item.title}</Title>
				<p dangerouslySetInnerHTML={{ __html: item.description }} />
			</Card.Content>

			<Card.Footer>
				<Button
					variant="secondary"
					as="a"
					className="nfd-w-full"
					href={window.NewfoldRuntime.linkTracker.addUtmParams(item.url)}
					target="_blank"
				>
					{item.cta}
				</Button>
			</Card.Footer>
		</Card>
	 );
}

const Help = () => {
	const renderHelpCards = () => {
		const helpItems = help;

		return (
			<div className="nfd-grid nfd-gap-6 nfd-grid-cols-1 sm:nfd-grid-cols-2 xl:nfd-grid-cols-3 2xl:nfd-grid-cols-3">
				{helpItems.map((item) => (
					<HelpCard key={item.name} item={item} />
				))}
			</div>
		);
	};

	return (
		<Page className={"wpwhb-app-help-page"}>
			<Container className={'wpwhb-app-help-container'}>
				<Container.Header>
					<Title as="h2" className="nfd-flex nfd-items-center nfd-gap-2">
						<QuestionMarkCircleIcon className="nfd-w-8 nfd-h-8" />
						{__('Help', 'wp-plugin-webhostbox')}
					</Title>
					<span>{__('We are available 24/7 to help answer questions and solve your problem', 'wp-plugin-webhostbox')}</span>
				</Container.Header>

				<Container.Block>
					{renderHelpCards()}
				</Container.Block>
			</Container>
		</Page>
	);
};

export default Help;
