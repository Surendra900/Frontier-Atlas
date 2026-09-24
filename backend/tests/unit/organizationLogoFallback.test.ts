import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { organizationLogoUrl } from "../../../frontend/lib/organizations";
import OrganizationLogo from "../../../frontend/components/domain/organizations/OrganizationLogo";

test("Test 1: organizationLogoUrl preserves valid standard logo URLs", () => {
  const validUrl = "https://ai.meta.com/static/images/logo.png";
  assert.strictEqual(organizationLogoUrl(validUrl), validUrl);

  const httpUrl = "http://example.com/logo.jpg";
  assert.strictEqual(organizationLogoUrl(httpUrl), httpUrl);

  const relativeUrl = "/logos/openai.svg";
  assert.strictEqual(organizationLogoUrl(relativeUrl), relativeUrl);

  const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  assert.strictEqual(organizationLogoUrl(dataUrl), dataUrl);
});

test("Test 2: organizationLogoUrl converts Clearbit proxy URLs to Google favicon service", () => {
  const clearbit = "https://logo.clearbit.com/anthropic.com";
  const expected = "https://www.google.com/s2/favicons?domain=anthropic.com&sz=128";
  assert.strictEqual(organizationLogoUrl(clearbit), expected);

  const clearbitSubdomain = "https://logo.clearbit.com/deepmind.google";
  const expectedSub = "https://www.google.com/s2/favicons?domain=deepmind.google&sz=128";
  assert.strictEqual(organizationLogoUrl(clearbitSubdomain), expectedSub);
});

test("Test 3: organizationLogoUrl returns undefined for missing or empty logo URLs", () => {
  assert.strictEqual(organizationLogoUrl(undefined), undefined);
  assert.strictEqual(organizationLogoUrl(null), undefined);
  assert.strictEqual(organizationLogoUrl(""), undefined);
  assert.strictEqual(organizationLogoUrl("   "), undefined);
});

test("Test 4: organizationLogoUrl returns undefined for invalid logo URLs to avoid broken requests", () => {
  assert.strictEqual(organizationLogoUrl("not_a_valid_url"), undefined);
  assert.strictEqual(organizationLogoUrl("ht!tp://bad-url"), undefined);
  assert.strictEqual(organizationLogoUrl("javascript:alert(1)"), undefined);
  assert.strictEqual(organizationLogoUrl("ftp://example.com/logo.png"), undefined);
  assert.strictEqual(organizationLogoUrl("https://logo.clearbit.com/"), undefined);
});

test("Test 5: OrganizationLogo element receives valid logo props", () => {
  const element = React.createElement(OrganizationLogo, {
    logo: "https://example.com/logo.png",
    name: "OpenAI",
    size: 20,
  });

  assert.ok(element.type);
  assert.strictEqual(element.props.logo, "https://example.com/logo.png");
  assert.strictEqual(element.props.name, "OpenAI");
  assert.strictEqual(element.props.size, 20);
});

test("Test 6: OrganizationLogo props support both card (size 20) and detail (size 34) layouts", () => {
  // Card layout test
  const cardElement = React.createElement(OrganizationLogo, {
    logo: null,
    name: "Meta AI",
    size: 20,
    iconClassName: "text-[#FF5A1F]",
  });
  assert.strictEqual(cardElement.props.size, 20);
  assert.strictEqual(cardElement.props.iconClassName, "text-[#FF5A1F]");

  // Detail layout test
  const detailElement = React.createElement(OrganizationLogo, {
    logo: "https://example.com/deepmind.png",
    name: "Google DeepMind",
    size: 34,
  });
  assert.strictEqual(detailElement.props.size, 34);
  assert.strictEqual(detailElement.props.name, "Google DeepMind");
});
