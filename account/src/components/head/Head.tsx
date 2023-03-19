import { MetaProvider, Title } from "@solidjs/meta";
import SiteHead from "../../data/siteHead";

export default function Head() {
  return (
    <MetaProvider>
      <Title>{SiteHead.title()}</Title>
    </MetaProvider>
  );
}
