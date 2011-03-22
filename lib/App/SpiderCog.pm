package App::SpiderCog;
use Mouse;
extends 'Cog::App';

our $VERSION = '0.10';

use constant webapp_class => 'App::SpiderCog::WebApp';

package App::SpiderCog::WebApp;
use Mouse;
extends 'Cog::WebApp';

use constant site_navigation => [
    '()',
    ['Start' => ['start']],
    ['Stop' => ['stop']],
];

use constant js_files => [qw(
    spidercog.js
)];

use constant url_map => [
    '()',
    ['/.*' => 'main'],
];

1;
