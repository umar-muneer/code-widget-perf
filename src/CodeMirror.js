import React from "react";
import "codemirror";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript.js";

const CODE = `package main
import (
  "fmt"
  "context"
  "time"
  "strings"
  "net/url"
  "github.com/gobuffalo/envy"
  "github.com/Azure/azure-sdk-for-go/services/storage/mgmt/2017-06-01/storage"
  "github.com/Azure/azure-storage-blob-go/2016-05-31/azblob"
  "github.com/Azure-Samples/azure-sdk-for-go-samples/internal/config"
  "github.com/Azure-Samples/azure-sdk-for-go-samples/internal/iam"
  "github.com/marstr/randname"
  "log"
)

var (
	_blobFormatString = "https://%s.blob.core.windows.net"
)

func addLocalEnvAndParse_() error {
	// parse env at top-level (also controls dotenv load)
	err := config.ParseEnvironment()
	if err != nil {
		return fmt.Errorf("failed to add top-level env: %v\n", err.Error())
	}

	return nil
}

func SetupEnvironment_() error {
	var err error
	err = addLocalEnvAndParse_()
	if err != nil {
		return err
	}
	return nil
}


func getStorageAccountsClient_() storage.AccountsClient {
	storageAccountsClient := storage.NewAccountsClient(config.SubscriptionID())
	auth, _ := iam.GetResourceManagementAuthorizer()
	storageAccountsClient.Authorizer = auth
	storageAccountsClient.AddToUserAgent(config.UserAgent())
	return storageAccountsClient
}

func getAccountKeys(ctx context.Context, accountName, accountGroupName string) (storage.AccountListKeysResult, error) {
	accountsClient := getStorageAccountsClient_()
	return accountsClient.ListKeys(ctx, accountGroupName, accountName)
}

func getAccountPrimaryKey_(ctx context.Context, accountName, accountGroupName string) string {
	response, err := getAccountKeys(ctx, accountName, accountGroupName)
	if err != nil {
		log.Fatalf("failed to list keys: %v", err)
	}
	return *(((*response.Keys)[0]).Value)
}

func GetContainerURL(ctx context.Context, accountName, accountGroupName, containerName string) azblob.ContainerURL {
	key := getAccountPrimaryKey_(ctx, accountName, accountGroupName)
	c := azblob.NewSharedKeyCredential(accountName, key)
	p := azblob.NewPipeline(c, azblob.PipelineOptions{
		Telemetry: azblob.TelemetryOptions{Value: config.UserAgent()},
	})
	u, _ := url.Parse(fmt.Sprintf(_blobFormatString, accountName))
	service := azblob.NewServiceURL(*u, p)
	container := service.NewContainerURL(containerName)
	return container
}

func getContainerName() string {
  prefix := "test-blockblobc-"
  return strings.ToLower(randname.GenerateWithPrefix(prefix, 5))
}  
func main() {
  accountName, _ := envy.MustGet("AZURE_STORAGE_ACCOUNT_NAME")
  groupName, _ := envy.MustGet("AZURE_STORAGE_ACCOUNT_GROUP_NAME")
  containerName := getContainerName()
  SetupEnvironment_()
  ctx, _ := context.WithTimeout(context.Background(), 600*time.Second)
  c := GetContainerURL(ctx, accountName, groupName, containerName)
  _, err := c.Create(
		ctx,
		azblob.Metadata{},
		azblob.PublicAccessContainer)
  if err != nil {
    log.Fatal(err)
    return
  }
  fmt.Println("created container with name", containerName)
}`;
class CodeMirrorEditor extends React.Component {
  state = {
    code: CODE
  };
  componentDidUpdate() {
    console.timeEnd("total-update-time");
  }
  onCodeChange = (editor, data, value) => {
    console.time("total-update-time");
    this.setState({ code: value });
  };
  render() {
    return (
      <CodeMirror
        value={this.state.code}
        onBeforeChange={this.onCodeChange}
        options={{
          mode: "javascript",
          theme: "material",
          lineNumbers: true
        }}
      />
    );
  }
}
export default CodeMirrorEditor;
