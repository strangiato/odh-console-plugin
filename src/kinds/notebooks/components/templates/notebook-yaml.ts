export const defaultNotebookYamlTemplate = `
apiVersion: kubeflow.org/v1
kind: Notebook
metadata:
  annotations:
    notebooks.opendatahub.io/inject-oauth: 'true'
    notebooks.opendatahub.io/last-image-selection: 's2i-minimal-notebook:2023.1'
    notebooks.opendatahub.io/last-size-selection: Small
    notebooks.opendatahub.io/oauth-logout-url: >-
      https://rhods-dashboard-redhat-ods-applications.apps.cluster-wkvc6.wkvc6.sandbox1967.opentlc.com/projects/example?notebookLogout=example
    opendatahub.io/username: admin
    openshift.io/description: ''
    openshift.io/display-name: example
  name: example
  labels:
    app: example
    opendatahub.io/dashboard: 'true'
    opendatahub.io/odh-managed: 'true'
    opendatahub.io/user: admin
spec:
  template:
    spec:
      affinity:
        nodeAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - preference:
                matchExpressions:
                  - key: nvidia.com/gpu.present
                    operator: NotIn
                    values:
                      - 'true'
              weight: 1
      containers:
        - resources:
            limits:
              cpu: '2'
              memory: 8Gi
            requests:
              cpu: '1'
              memory: 8Gi
          readinessProbe:
            failureThreshold: 3
            httpGet:
              path: /notebook/example/example/api
              port: notebook-port
              scheme: HTTP
            initialDelaySeconds: 10
            periodSeconds: 5
            successThreshold: 1
            timeoutSeconds: 1
          name: example
          livenessProbe:
            failureThreshold: 3
            httpGet:
              path: /notebook/example/example/api
              port: notebook-port
              scheme: HTTP
            initialDelaySeconds: 10
            periodSeconds: 5
            successThreshold: 1
            timeoutSeconds: 1
          env:
            - name: NOTEBOOK_ARGS
              value: |-
                --ServerApp.port=8888
                                  --ServerApp.token=''
                                  --ServerApp.password=''
                                  --ServerApp.base_url=/notebook/example/example
                                  --ServerApp.quit_button=False
                                  --ServerApp.tornado_settings={"user":"admin","hub_host":"https://rhods-dashboard-redhat-ods-applications.apps.cluster-wkvc6.wkvc6.sandbox1967.opentlc.com","hub_prefix":"/projects/example"}
            - name: JUPYTER_IMAGE
              value: >-
                image-registry.openshift-image-registry.svc:5000/redhat-ods-applications/s2i-minimal-notebook:2023.1
          ports:
            - containerPort: 8888
              name: notebook-port
              protocol: TCP
          imagePullPolicy: Always
          volumeMounts:
            - mountPath: /opt/app-root/src
              name: example
            - mountPath: /dev/shm
              name: shm
          image: >-
            image-registry.openshift-image-registry.svc:5000/redhat-ods-applications/s2i-minimal-notebook:2023.1
          workingDir: /opt/app-root/src
        - resources:
            limits:
              cpu: 100m
              memory: 64Mi
            requests:
              cpu: 100m
              memory: 64Mi
          readinessProbe:
            failureThreshold: 3
            httpGet:
              path: /oauth/healthz
              port: oauth-proxy
              scheme: HTTPS
            initialDelaySeconds: 5
            periodSeconds: 5
            successThreshold: 1
            timeoutSeconds: 1
          name: oauth-proxy
          livenessProbe:
            failureThreshold: 3
            httpGet:
              path: /oauth/healthz
              port: oauth-proxy
              scheme: HTTPS
            initialDelaySeconds: 30
            periodSeconds: 5
            successThreshold: 1
            timeoutSeconds: 1
          env:
            - name: NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
          ports:
            - containerPort: 8443
              name: oauth-proxy
              protocol: TCP
          imagePullPolicy: Always
          volumeMounts:
            - mountPath: /etc/oauth/config
              name: oauth-config
            - mountPath: /etc/tls/private
              name: tls-certificates
          image: >-
            registry.redhat.io/openshift4/ose-oauth-proxy@sha256:4bef31eb993feb6f1096b51b4876c65a6fb1f4401fee97fa4f4542b6b7c9bc46
          args:
            - '--provider=openshift'
            - '--https-address=:8443'
            - '--http-address='
            - '--openshift-service-account=example'
            - '--cookie-secret-file=/etc/oauth/config/cookie_secret'
            - '--cookie-expire=24h0m0s'
            - '--tls-cert=/etc/tls/private/tls.crt'
            - '--tls-key=/etc/tls/private/tls.key'
            - '--upstream=http://localhost:8888'
            - '--upstream-ca=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt'
            - '--email-domain=*'
            - '--skip-provider-button'
            - >-
              --openshift-sar={"verb":"get","resource":"notebooks","resourceAPIGroup":"kubeflow.org","resourceName":"example","namespace":"$(NAMESPACE)"}
            - >-
              --logout-url=https://rhods-dashboard-redhat-ods-applications.apps.cluster-wkvc6.wkvc6.sandbox1967.opentlc.com/projects/example?notebookLogout=example
      enableServiceLinks: false
      serviceAccountName: example
      volumes:
        - name: example
          persistentVolumeClaim:
            claimName: example
        - emptyDir:
            medium: Memory
          name: shm
        - name: oauth-config
          secret:
            defaultMode: 420
            secretName: example-oauth-config
        - name: tls-certificates
          secret:
            defaultMode: 420
            secretName: example-tls
`;
