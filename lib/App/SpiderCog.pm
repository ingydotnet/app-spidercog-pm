package App::SpiderCog;
use Mouse;
extends 'Cog::App';

our $VERSION = '0.10';

use constant webapp_class => 'App::SpiderCog::WebApp';
use constant store_class => 'App::SpiderCog::Store';
use constant content_class => 'App::SpiderCog::Content';

package App::SpiderCog::WebApp;
use Mouse;
extends 'Cog::WebApp';

use IO::All;

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

use constant post_map => [
    '()',
    ['/save/cable/?' => 'save_cable'],
    ['/save/html/?' => 'save_html'],
];

sub handle_save_cable {
    my $self = shift;
    my $data = $self->env->{post_data} or die;
    my $node = $self->store->add('cable');
    $data->{Name} = [delete $data->{publish_title}];
    $self->store->update_node_from_hash($node, $data);
    $self->store->put($node);
    $self->store->flush;
    return;
}

sub handle_save_html {
    my $self = shift;
    my $data = $self->env->{post_data} or die;
    my $html = $data->{html} or die;
    io('all.html')->print($html);
    return;
}

package App::SpiderCog::Store;
use Mouse;
extends 'Cog::Store';

use constant schemata => [
    'App::SpiderCog::Cable::Schema',
];

sub put {
    my ($self, $node) = @_;
    my $pointer = $self->content->content_pointer($node);
    return if -e $pointer;
    $self->content->update($node);
}

package App::SpiderCog::Cable::Schema;
use Mouse;
extends 'Cog::Schema';

use constant type => 'cable';
use constant parent => 'CogNode';
use constant fields => [
    'publish_date',
    'cable_title',
    'cable_sent',
    'cable_number',
];

package App::SpiderCog::Content;
use Mouse;
extends 'Cog::Content';

sub flush {}

1;
