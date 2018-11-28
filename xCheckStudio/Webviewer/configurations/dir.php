var checkCaseFiles = <?php $out = array();
foreach (glob('*.xml') as $filename) {
    $p = pathinfo($filename);
    $out[] = $p['filename'];
}
echo json_encode($out); ?>;