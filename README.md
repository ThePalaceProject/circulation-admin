# circulation-web
Web front-end for the Circulation Manager administrative interface

## Setup

This package is meant to be used with the Library Simplified [Circulation Manager](https://github.com/NYPL-Simplified/circulation).

To use the published version with your circulation manager, run `npm install` from `api/admin`.

If you're working on the admin interface and want to test local changes, you can link your local clone of this repository to your local circulation manager. Run `npm link` in this repository, then run `npm link simplified-circulation-web` from `api/admin` in the circulation manager.

## Publishing

This package is [published to npm](https://www.npmjs.com/package/simplified-circulation-web).

To publish a new version, you need to create an npm account and be a collaborator on the package. Then you can run `npm publish` from your local copy of the repository.


## License

```
Copyright © 2015 The New York Public Library, Astor, Lenox, and Tilden Foundations

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
