import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

/** FAQ list on the shadcn Accordion; server-rendered, so answers are in the HTML for search engines. */
export default function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
	return (
		<Accordion>
			{items.map((item, index) => (
				<AccordionItem key={index} value={String(index)}>
					<AccordionTrigger>{item.question}</AccordionTrigger>
					<AccordionContent hiddenUntilFound>
						<p>{item.answer}</p>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
}
