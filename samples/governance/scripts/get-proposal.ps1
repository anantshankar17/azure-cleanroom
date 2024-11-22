function Get-Proposal {
  [CmdletBinding()]
  param
  (
    [string]
    $proposalId = "",

    [switch]
    $all,

    [string]
    $port = ""
  )

  . $PSScriptRoot/common.ps1

  $port = GetPortOrDie($port)

  if ($all) {
    $response = (curl -sS -X GET localhost:$port/proposals)
    CheckLastExitCode
    return $response
  }

  if ($proposalId -eq "") {
    throw "-all or -proposalId must be specified."
  }

  $response = (curl -sS -X GET localhost:$port/proposals/$proposalId)
  CheckLastExitCode
  $found = (($response | jq -r '.proposalId') -eq $proposalId)
  if (!$found) {
    return $response
  }

  $actions = (curl -sS -X GET localhost:$port/proposals/$proposalId/actions)
  CheckLastExitCode

  # Merge proposal and actions into single json string.
  return $response.TrimEnd("}") + "," + $actions.TrimStart("{")
}