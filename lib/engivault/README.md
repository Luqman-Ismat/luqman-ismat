# EngiVault integration

Calculation models, calculator definitions, unit definitions, and their existing tests are imported from Luqman-Ismat/engivault, commit ea8d7f267876bb6bc8d29535cfb0c49cc7242e79 (apps/website). Source references and model limitations remain in the library.

The native interface is under /engivault, with 45 calculator definitions and the full engineering unit converter. Inputs and calculations stay in the browser. Results clear when inputs change. JSON downloads include input units, results, method, and sources. No account or external API credentials are needed.

This integrates public calculation functionality, not the separate product's authentication, saved cloud projects, material catalog, knowledge base, or API service. Those have not been migrated or represented as connected here. The case study retains context about the original standalone product.

Run `npm run test:engivault` for the original engineering/unit tests, every configured example, and the integration's temperature conversion dispatch test. Formula changes must retain the source references and relevant regression checks.
